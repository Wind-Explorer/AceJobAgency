using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AceJobAgency.Data;
using AceJobAgency.Entities;
using AceJobAgency.Utilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

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
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            {
                return Unauthorized("Invalid email or password.");
            }

            var token = GenerateJwtToken(user);
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
            return Ok(user);
        }

        [Authorize]
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = _context.Users.FirstOrDefault(u => u.Id == userId && u.IsActive == 1);
            if (user == null)
            {
                return NotFound();
            }

            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.Password))
            {
                return BadRequest("Current password is incorrect.");
            }
            
            if (!AccountManagement.IsPasswordComplex(request.NewPassword))
            {
                return BadRequest("Password must be at least 12 characters long and include uppercase, lowercase, number, and special character.");
            }

            user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.UpdatedAt = DateTime.Now;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
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
                Expires = DateTime.UtcNow.AddHours(2),
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

            if (string.IsNullOrEmpty(user.ResumeName))
            {
                return NotFound("No resume found.");
            }

            var filePath = Path.Combine(_serverPath, user.ResumeName);

            if (!System.IO.File.Exists(filePath))
            {
                return NotFound("Resume file not found.");
            }

            var mimeType = "application/octet-stream";
            var extension = Path.GetExtension(filePath).ToLower();
            if (extension == ".pdf") mimeType = "application/pdf";
            else if (extension == ".doc" || extension == ".docx") mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

            var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
            return new FileStreamResult(fileStream, mimeType) { FileDownloadName = user.ResumeName };
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}