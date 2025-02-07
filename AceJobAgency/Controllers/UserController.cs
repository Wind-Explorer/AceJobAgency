using System.Diagnostics;
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
            var userExists = context.Users.Any(u => u.Email == user.Email);
            if (userExists)
            {
                return BadRequest("User with the same email already exists.");
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(user.Password);

            user.Password = passwordHash;
            var userId = Guid.NewGuid().ToString();
            user.Id = userId;

            await context.Users.AddAsync(user);
            await context.SaveChangesAsync();
            return Ok(user);
        }
    }
}
