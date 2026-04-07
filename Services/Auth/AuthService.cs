using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SyncStock.Contexts;
using SyncStock.Contracts.Auth;
using SyncStock.Models;

namespace SyncStock.Services.Auth;

public sealed class AuthService : IAuthService
{
    private readonly EstoqueContext _context;
    private readonly IPasswordHasher<Usuario> _passwordHasher;

    public AuthService(EstoqueContext context, IPasswordHasher<Usuario> passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<Usuario?> AuthenticateAsync(
        string login,
        string senha,
        CancellationToken cancellationToken = default)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Login == login, cancellationToken);

        if (usuario is null || string.IsNullOrWhiteSpace(usuario.Senha))
        {
            return null;
        }

        if (IsLegacyPlainTextPassword(usuario.Senha))
        {
            if (!string.Equals(usuario.Senha, senha, StringComparison.Ordinal))
            {
                return null;
            }

            usuario.Senha = _passwordHasher.HashPassword(usuario, senha);
            await _context.SaveChangesAsync(cancellationToken);
            return usuario;
        }

        var verificationResult = _passwordHasher.VerifyHashedPassword(usuario, usuario.Senha, senha);
        if (verificationResult == PasswordVerificationResult.Failed)
        {
            return null;
        }

        if (verificationResult == PasswordVerificationResult.SuccessRehashNeeded)
        {
            usuario.Senha = _passwordHasher.HashPassword(usuario, senha);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return usuario;
    }

    public ClaimsPrincipal CreatePrincipal(Usuario usuario)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new(ClaimTypes.Name, usuario.Nome),
            new(ClaimTypes.Role, usuario.Perfil),
            new("login", usuario.Login)
        };

        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        return new ClaimsPrincipal(identity);
    }

    public CurrentUserResponse ToCurrentUserResponse(Usuario usuario)
    {
        return new CurrentUserResponse(usuario.Nome, usuario.Login, usuario.Perfil);
    }

    public CurrentUserResponse ToCurrentUserResponse(ClaimsPrincipal principal)
    {
        var nome = principal.FindFirstValue(ClaimTypes.Name) ?? string.Empty;
        var login = principal.FindFirstValue("login") ?? string.Empty;
        var perfil = principal.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

        return new CurrentUserResponse(nome, login, perfil);
    }

    private static bool IsLegacyPlainTextPassword(string senha)
    {
        return !senha.StartsWith("AQAAAA", StringComparison.Ordinal);
    }
}
