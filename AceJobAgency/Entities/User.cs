using System.ComponentModel.DataAnnotations;

namespace AceJobAgency.Entities
{
    public class User
    {
        [Key]
        [MaxLength(36)]
        public required string Id { get; set; }

        [Required]
        [StringLength(50)]
        public required string FirstName { get; set; }

        [Required]
        [StringLength(50)]
        public required string LastName { get; set; }

        [Required]
        public required int Gender { get; set; }

        [Required]
        [StringLength(9, MinimumLength = 9)]
        public required string NationalRegistrationIdentityCardNumber { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(128)]
        public required string Email { get; set; }

        [Required]
        [DataType(DataType.Password)]
        [MaxLength(128)]
        public required string Password { get; set; }

        [Required]
        [DataType(DataType.Date)]
        public required DateTime DateOfBirth { get; set; }

        [MaxLength(128)]
        public required string ResumeName { get; set; }

        [MaxLength(255)]
        public string WhoAmI { get; set; } = string.Empty;

        public int IsActive { get; set; } = 1;
        
        [DataType(DataType.Date)]
        public DateTime CreatedAt { get; init; } = DateTime.Now;
        
        [DataType(DataType.Date)]
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
    }
}