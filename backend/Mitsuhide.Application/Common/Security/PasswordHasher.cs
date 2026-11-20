namespace Mitsuhide.Application.Common.Security;

/// <summary>
/// Enterprise password hashing and verification utility using BCrypt.
/// Automatically handles legacy plain-text password verification and seamless upgrade to BCrypt.
/// </summary>
public static class PasswordHasher
{
    private const int WorkFactor = 11;

    /// <summary>
    /// Hashes a plain-text password using BCrypt with salt.
    /// </summary>
    public static string HashPassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
            throw new ArgumentException("Password cannot be empty.", nameof(password));

        return BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);
    }

    /// <summary>
    /// Verifies a plain-text password against a stored hash (or legacy plain-text).
    /// </summary>
    public static bool VerifyPassword(string password, string? storedHash)
    {
        if (string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(storedHash))
            return false;

        // Check if stored string is a valid BCrypt hash ($2a$, $2b$, or $2y$)
        if (storedHash.StartsWith("$2") && storedHash.Length >= 59)
        {
            try
            {
                return BCrypt.Net.BCrypt.Verify(password, storedHash);
            }
            catch
            {
                return false;
            }
        }

        // Seamless migration fallback: plain-text equality check for legacy unhashed passwords
        return string.Equals(password, storedHash, StringComparison.Ordinal);
    }

    /// <summary>
    /// Checks whether the stored password representation is not yet a BCrypt hash and needs rehashing.
    /// </summary>
    public static bool NeedsRehash(string? storedHash)
    {
        if (string.IsNullOrWhiteSpace(storedHash))
            return true;

        return !storedHash.StartsWith("$2") || storedHash.Length < 59;
    }
}
