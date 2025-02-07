using AceJobAgency.Data;
using AceJobAgency.Entities;
using Microsoft.AspNetCore.Mvc;

namespace AceJobAgency.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController(DataContext context, IConfiguration configuration) : Controller
    {
        [HttpPost]
        public async Task<IActionResult> Register(User user)
        {
            var userEmailExists = context.Users.Any(u => u.Email == user.Email);
            var userNationalRegistrationIdentityCardNumberExists = context.Users.Any(
                u => u.NationalRegistrationIdentityCardNumber
                     == user.NationalRegistrationIdentityCardNumber
                );
            if (userEmailExists || userNationalRegistrationIdentityCardNumberExists)
            {
                return BadRequest("User with the same email already exists.");
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(user.Password);

            user.Password = passwordHash;
            var userId = Guid.NewGuid().ToString();
            user.Id = userId;
            user.IsActive = 1;

            await context.Users.AddAsync(user);
            await context.SaveChangesAsync();
            return Ok(user);
        }
    }
}
