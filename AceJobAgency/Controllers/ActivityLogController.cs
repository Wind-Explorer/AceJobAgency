using AceJobAgency.Data;
using AceJobAgency.Entities;

namespace AceJobAgency.Controllers;

public class ActivityLogController
{
    private readonly DataContext _context;

    public ActivityLogController(DataContext context)
    {
        _context = context;
    }
    
    public void LogUserActivity(string userId, string activity, string ipAddress)
    {
        var logEntry = new ActivityLog
        {
            Id = Guid.NewGuid().ToString(),
            UserId = userId,
            Activity = activity,
            IpAddress = ipAddress
        };
        _context.ActivityLogs.Add(logEntry);
        _context.SaveChanges();
    }
}