using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AceJobAgency.Data;
using AceJobAgency.Entities;
using AceJobAgency.Utilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OtpNet;
using QRCoder;

namespace AceJobAgency.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : Controller
    {
        private readonly DataContext _context;
        private readonly IConfiguration _configuration;
        private readonly IEncryptionService _encryptionService;
        
        private readonly string _serverPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "resumes");

        public UserController(DataContext context, IConfiguration configuration, IEncryptionService encryptionService)
        {
            _context = context;
            _configuration = configuration;
            _encryptionService = encryptionService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(User user)
        {
            if (!AccountManagement.IsPasswordComplex(user.Password))
            {
                return BadRequest("Password must be at least 12 characters long and include uppercase, lowercase, number, and special character.");
            }
            
            var encryptedNric = _encryptionService.Encrypt(user.NationalRegistrationIdentityCardNumber);
            
            var emailExists = _context.Users.Any(u => u.Email == user.Email);
            var nricExists = _context.Users.Any(u => u.NationalRegistrationIdentityCardNumber == encryptedNric);
            if (emailExists || nricExists)
            {
                return BadRequest("User with the same email or NRIC already exists.");
            }

            user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
            user.Id = Guid.NewGuid().ToString();
            user.IsActive = 1;
            user.NationalRegistrationIdentityCardNumber = encryptedNric;

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            var response = new
            {
                user.Id,
                user.Email,
                NationalRegistrationIdentityCardNumber = _encryptionService.Decrypt(user.NationalRegistrationIdentityCardNumber),
                user.FirstName,
                user.LastName,
                user.DateOfBirth,
                user.WhoAmI,
                user.ResumeName,
            };
            return Ok(response);
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == request.Email && u.IsActive == 1);
            var ipAddress = HttpContext.Connection.RemoteIpAddress!.ToString();

            if (user == null)
            {
                return Unauthorized("Invalid email or password.");
            }

            if (user.IsLockedOut && user.LockoutEndTime > DateTime.Now)
            {
                new ActivityLogController(_context).LogUserActivity(user.Id, "Login rejected: Locked out", ipAddress);
                return Unauthorized("Account is locked. Try again later.");
            }

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            {
                user.FailedLoginAttempts++;
                if (user.FailedLoginAttempts >= 5)
                {
                    user.IsLockedOut = true;
                    user.LockoutEndTime = DateTime.Now.AddMinutes(1);
                    new ActivityLogController(_context).LogUserActivity(user.Id, "Account locked due to 5 consecutive failed attempts.", ipAddress);
                }
                _context.SaveChanges();
                new ActivityLogController(_context).LogUserActivity(user.Id, "Login rejected: invalid password", ipAddress);
                return Unauthorized("Invalid email or password.");
            }

            user.FailedLoginAttempts = 0;
            user.IsLockedOut = false;
            user.LockoutEndTime = null;
            _context.SaveChanges();

            if (request.Verify)
            {
                return Ok();
            }

            var token = GenerateJwtToken(user);
            new ActivityLogController(_context).LogUserActivity(user.Id, "Login successful", ipAddress);
            return Ok(new { token });
        }

        [Authorize]
        [HttpGet("profile")]
        public IActionResult GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = _context.Users.FirstOrDefault(u => u.Id == userId && u.IsActive == 1);
            if (user == null)
            {
                return NotFound();
            }

            var decryptedNric = _encryptionService.Decrypt(user.NationalRegistrationIdentityCardNumber);
            var response = new
            {
                user.Id,
                user.Email,
                NationalRegistrationIdentityCardNumber = decryptedNric,
                user.FirstName,
                user.LastName,
                user.Gender,
                user.DateOfBirth,
                user.WhoAmI,
                user.ResumeName,
            };
            var ipAddress = HttpContext.Connection.RemoteIpAddress!.ToString();
            new ActivityLogController(_context).LogUserActivity(user.Id, "Fetched user profile", ipAddress);
            return Ok(response);
        }

        [Authorize]
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile(User updatedUser)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = _context.Users.FirstOrDefault(u => u.Id == userId && u.IsActive == 1);
            if (user == null)
            {
                return NotFound();
            }

            user.FirstName = updatedUser.FirstName;
            user.LastName = updatedUser.LastName;
            user.DateOfBirth = updatedUser.DateOfBirth;
            user.WhoAmI = updatedUser.WhoAmI;
            user.UpdatedAt = DateTime.Now;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            var ipAddress = HttpContext.Connection.RemoteIpAddress!.ToString();
            new ActivityLogController(_context).LogUserActivity(user.Id, "Updated user profile", ipAddress);
            return Ok(user);
        }

        [Authorize]
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress!.ToString();
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = _context.Users.FirstOrDefault(u => u.Id == userId && u.IsActive == 1);
            if (user == null)
            {
                return NotFound();
            }

            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.Password))
            {
                new ActivityLogController(_context).LogUserActivity(user.Id, "Change password failed: Current password is incorrect", ipAddress);
                return BadRequest("Current password is incorrect.");
            }
            
            if (BCrypt.Net.BCrypt.Verify(request.NewPassword, user.Password))
            {
                new ActivityLogController(_context).LogUserActivity(user.Id, "Change password failed: Tried changing to the same password", ipAddress);
                return BadRequest("New password can't be the same as the old password.");
            }
            
            if (!AccountManagement.IsPasswordComplex(request.NewPassword))
            {
                new ActivityLogController(_context).LogUserActivity(user.Id, "Change password failed: Password not complex enough", ipAddress);
                return BadRequest("Password must be at least 12 characters long and include uppercase, lowercase, number, and special character.");
            }

            if ((!string.IsNullOrEmpty(user.Password) && BCrypt.Net.BCrypt.Verify(request.NewPassword, user.Password)) ||
                (!string.IsNullOrEmpty(user.PreviousPassword1) && BCrypt.Net.BCrypt.Verify(request.NewPassword, user.PreviousPassword1)) ||
                (!string.IsNullOrEmpty(user.PreviousPassword2) && BCrypt.Net.BCrypt.Verify(request.NewPassword, user.PreviousPassword2)))
            {
                new ActivityLogController(_context).LogUserActivity(user.Id, "Change password failed: New password matches one of the previous passwords", ipAddress);
                return BadRequest("New password cannot be one of the last two passwords.");
            }

            user.PreviousPassword2 = user.PreviousPassword1;
            user.PreviousPassword1 = user.Password;

            user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.UpdatedAt = DateTime.Now;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            new ActivityLogController(_context).LogUserActivity(user.Id, "Change password successful", ipAddress);
            return Ok("Password updated successfully.");
        }

        [Authorize]
        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteAccount()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = _context.Users.FirstOrDefault(u => u.Id == userId && u.IsActive == 1);
            if (user == null)
            {
                return NotFound();
            }

            user.IsActive = 0;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return Ok("Account deleted successfully.");
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Authentication:Secret"] ?? "some_secret_key");
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity([
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    new Claim(ClaimTypes.Email, user.Email)
                ]),
                Expires = DateTime.UtcNow.AddMinutes(15),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                                                            SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    
        [Authorize]
        [HttpPost("upload-resume")]
        public async Task<IActionResult> UploadResume(IFormFile? file)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = _context.Users.FirstOrDefault(u => u.Id == userId && u.IsActive == 1);
            if (user == null)
            {
                return NotFound();
            }

            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            var fileName = $"{userId}_{Path.GetFileName(file.FileName)}";
            var filePath = Path.Combine(_serverPath, fileName);

            // Ensure the directory exists
            if (!Directory.Exists(_serverPath))
            {
                Directory.CreateDirectory(_serverPath);
            }

            // Validate file type and size
            var allowedExtensions = new[] { ".pdf", ".doc", ".docx" };
            var extension = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest("Unsupported file type. Only PDF and DOC/DOCX files are allowed.");
            }

            if (file.Length > 5 * 1024 * 1024) // 5MB
            {
                return BadRequest("File size exceeds the maximum limit of 5MB.");
            }

            // Save file to server storage
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            user.ResumeName = fileName;
            user.UpdatedAt = DateTime.Now;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            
            var ipAddress = HttpContext.Connection.RemoteIpAddress!.ToString();
            new ActivityLogController(_context).LogUserActivity(user.Id, "Updated user profile", ipAddress);

            return Ok(new { ResumeName = user.ResumeName });
        }

        [Authorize]
        [HttpGet("resume")]
        public IActionResult GetResume()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = _context.Users.FirstOrDefault(u => u.Id == userId && u.IsActive == 1);
            if (user == null)
            {
                return NotFound();
            }
            
            var ipAddress = HttpContext.Connection.RemoteIpAddress!.ToString();

            if (string.IsNullOrEmpty(user.ResumeName))
            {
                new ActivityLogController(_context).LogUserActivity(user.Id, "Download resume failed: No resume found", ipAddress);
                return NotFound("No resume found.");
            }

            var filePath = Path.Combine(_serverPath, user.ResumeName);

            if (!System.IO.File.Exists(filePath))
            {
                new ActivityLogController(_context).LogUserActivity(user.Id, "Download resume failed: Resume file missing", ipAddress);
                return NotFound("Resume file not found.");
            }

            var mimeType = "application/octet-stream";
            var extension = Path.GetExtension(filePath).ToLower();
            if (extension == ".pdf") mimeType = "application/pdf";
            else if (extension == ".doc" || extension == ".docx") mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

            var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
            new ActivityLogController(_context).LogUserActivity(user.Id, "Download resume successful", ipAddress);
            return new FileStreamResult(fileStream, mimeType) { FileDownloadName = user.ResumeName };
        }
        
        private string GenerateBase32Secret()
        {
            var bytes = KeyGeneration.GenerateRandomKey(20);
            var base32Secret = Base32Encoding.ToString(bytes);
            return base32Secret;
        }

        // Generate a QR code as a data URL
        private string GenerateQrCode(string otpauthUrl)
        {
            using var qrGenerator = new QRCodeGenerator();
            using var qrCodeData = qrGenerator.CreateQrCode(otpauthUrl, QRCodeGenerator.ECCLevel.Q);
            using var qrCode = new Base64QRCode(qrCodeData);
            var qrCodeImage = qrCode.GetGraphic(20);
            return $"data:image/png;base64,{qrCodeImage}";
        }

        [Authorize]
        [HttpPost("enable-2fa")]
        public async Task<IActionResult> Enable2FA()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive == 1);
            if (user == null)
            {
                return NotFound("User not found");
            }

            var base32Secret = GenerateBase32Secret();
            user.Secret = base32Secret;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            var totp = new Totp(Base32Encoding.ToBytes(base32Secret));
            var uriString = new OtpUri(OtpType.Totp, base32Secret, user.Email, "Ace Job Agency").ToString();
            var qrCodeUrl = GenerateQrCode(uriString);

            return Ok(new
            {
                qrCodeUrl,
                secret = base32Secret
            });
        }

        [Authorize]
        [HttpPost("disable-2fa")]
        public async Task<IActionResult> Disable2FA()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive == 1);
            if (user == null)
            {
                return NotFound("User not found");
            }

            user.Secret = null;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok(new { status = "success", message = "2FA disabled" });
        }

        [HttpPost("verify-2fa")]
        public async Task<IActionResult> Verify2FA([FromBody] Verify2FaRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive == 1);
            if (user == null)
            {
                return NotFound("User not found");
            }

            if (string.IsNullOrEmpty(user.Secret))
            {
                return BadRequest("2FA is not enabled for this user");
            }

            var totp = new Totp(Base32Encoding.ToBytes(user.Secret));
            var isValid = totp.VerifyTotp(request.Token, out _, VerificationWindow.RfcSpecifiedNetworkDelay);

            if (isValid)
            {
                return Ok(new { status = "success", message = "Authentication successful" });
            }
            else
            {
                return Unauthorized(new { status = "fail", message = "Authentication failed" });
            }
        }

        [HttpPost("has-2fa")]
        public async Task<IActionResult> Has2FA([FromBody] Has2FaRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive == 1);
            if (user == null)
            {
                return NotFound("User not found");
            }

            return Ok(new { status = "success", enabled = !string.IsNullOrEmpty(user.Secret) });
        }
    }

    public class LoginRequest
    {
        public bool Verify { get; set; } = false;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
    
    public class Verify2FaRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
    }
    
    public class Has2FaRequest
    {
        public string Email { get; set; }
    }
}