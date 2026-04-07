using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using SyncStock.Models;
using SyncStock.Services.Auth;

namespace SyncStock.Controllers;

public class AuthController : Controller
{
    // tem que referenciar cada pagina no controller seguindo o padrão nome : controller igual no JAVAFX 
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    public IActionResult Login()
    {
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> Login(string login, string senha, CancellationToken cancellationToken)
    {
        var usuario = await _authService.AuthenticateAsync(login, senha, cancellationToken);
        if (usuario is not null)
        {
            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                _authService.CreatePrincipal(usuario));

            SyncLegacySession(usuario);
            return RedirectToAction("Index", "Home");
        }

        ViewBag.Erro = "Usuário ou senha inválidos";
        return View();
    }

    public async Task<IActionResult> Logout()
    {
        HttpContext.Session.Clear();
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return RedirectToAction("Login");
    }

    private void SyncLegacySession(Usuario usuario)
    {
        HttpContext.Session.SetString("UsuarioLogado", usuario.Nome);
        HttpContext.Session.SetString("Perfil", usuario.Perfil);
    }
}
