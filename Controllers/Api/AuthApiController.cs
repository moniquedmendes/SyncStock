using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SyncStock.Contracts.Auth;
using SyncStock.Models;
using SyncStock.Services.Auth;

namespace SyncStock.Controllers.Api;

[ApiController]
[Route("api/auth")]
public sealed class AuthApiController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthApiController(IAuthService authService)
    {
        _authService = authService;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<CurrentUserResponse>> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var usuario = await _authService.AuthenticateAsync(request.Login, request.Senha, cancellationToken);
        if (usuario is null)
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Invalid credentials",
                Detail = "The provided login or password is invalid."
            });
        }

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            _authService.CreatePrincipal(usuario));

        SyncLegacySession(usuario);

        return Ok(_authService.ToCurrentUserResponse(usuario));
    }

    [Authorize]
    [HttpGet("me")]
    public ActionResult<CurrentUserResponse> Me()
    {
        return Ok(_authService.ToCurrentUserResponse(User));
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        HttpContext.Session.Clear();
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return NoContent();
    }

    private void SyncLegacySession(Usuario usuario)
    {
        HttpContext.Session.SetString("UsuarioLogado", usuario.Nome);
        HttpContext.Session.SetString("Perfil", usuario.Perfil);
    }
}
