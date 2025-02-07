using System.Text.RegularExpressions;

namespace AceJobAgency.Utilities;

public class AccountManagement
{
    public static bool IsPasswordComplex(string password)
    {
        if (string.IsNullOrEmpty(password) || password.Length < 12)
            return false;

        // Require at least one uppercase, one lowercase, one digit, and one special character
        bool hasUpperCase = Regex.IsMatch(password, @"[A-Z]");
        bool hasLowerCase = Regex.IsMatch(password, @"[a-z]");
        bool hasDigit = Regex.IsMatch(password, @"\d");
        bool hasSpecialChar = Regex.IsMatch(password, @"[^a-zA-Z0-9]");

        return hasUpperCase && hasLowerCase && hasDigit && hasSpecialChar;
    }
}