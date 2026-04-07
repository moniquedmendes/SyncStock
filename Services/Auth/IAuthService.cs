using System.Security.Claims;
using SyncStock.Contracts.Auth;
using SyncStock.Models;

namespace SyncStock.Services.Auth;

public interface IAuthService
{
    Task<Usuario?> AuthenticateAsync(string login, string senha, CancellationToken cancellationToken = default);
    ClaimsPrincipal CreatePrincipal(Usuario usuario);
    CurrentUserResponse ToCurrentUserResponse(Usuario usuario);
    CurrentUserResponse ToCurrentUserResponse(ClaimsPrincipal principal);
}
