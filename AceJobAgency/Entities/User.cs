using System.ComponentModel.DataAnnotations;

namespace AceJobAgency.Entities
{
    public class User
    {
        [Key]
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
        public required string NRIC { get; set; }

        [Required]
        [EmailAddress]
        public required string Email { get; set; }

        [Required]
        [DataType(DataType.Password)]
        public required string Password { get; set; }

        [Required]
        [DataType(DataType.Date)]
        public required DateTime DateOfBirth { get; set; }

        public required string ResumeName { get; set; }

        public required string WhoAmI { get; set; }
    }
}