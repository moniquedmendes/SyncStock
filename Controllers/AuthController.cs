using Microsoft.AspNetCore.Mvc;
using SyncStock.Contexts;
using System.Linq;

namespace SyncStock.Controllers;

public class AuthController : Controller
{
    // tem que referenciar cada pagina no controller seguindo o padrão nome : controller igual no JAVAFX 
    private readonly EstoqueContext _context;

    public AuthController(EstoqueContext context)
    {
        _context = context;
    }
    public IActionResult Login()
    {
        return View();
    }

    [HttpPost]

    public IActionResult Login(string login, string senha)
    {
        var usuario = _context.Usuarios
            .FirstOrDefault(u => u.Login == login && u.Senha == senha);

        if (usuario != null)
        {
            //HttpContext.Session.SetString("UsuarioLogado", usuario.Login);
            HttpContext.Session.SetString("UsuarioLogado", usuario.Nome);
            HttpContext.Session.SetString("Perfil", usuario.Perfil);


            return RedirectToAction("Index", "Home");
        }

        ViewBag.Erro = "Usuário ou senha inválidos";
        return View();
    }

    public IActionResult Logout()
    {
        HttpContext.Session.Clear();
        return RedirectToAction("Login");
    }

}