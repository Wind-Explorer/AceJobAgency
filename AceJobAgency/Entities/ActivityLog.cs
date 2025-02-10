using System.ComponentModel.DataAnnotations;

namespace AceJobAgency.Entities;

public class ActivityLog
{
    [Key]
    [MaxLength(36)]
    public required string Id { get; set; }

    [Required]
    [StringLength(36)]
    public required string UserId { get; set; }
    
    [Required]
    [MaxLength(255)]
    public required string Activity { get; set; }
    
    [Required]
    [StringLength(15)]
    public required string IpAddress { get; set; }
    
    [DataType(DataType.Date)]
    public DateTime CreatedAt { get; init; } = DateTime.Now;
}