using AceJobAgency.Entities;
using Microsoft.EntityFrameworkCore;

namespace AceJobAgency.Data
{
    public class DataContext(IConfiguration configuration) : DbContext
    {
        protected override void OnConfiguring(DbContextOptionsBuilder
        optionsBuilder)
        {
            var connectionString = configuration.GetConnectionString(
            "DefaultConnection");
            if (connectionString != null)
            {
                optionsBuilder.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
            }
        }
        public DbSet<User> Users { get; set; }
    }
}
