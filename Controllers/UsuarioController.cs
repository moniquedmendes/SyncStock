using Microsoft.AspNetCore.Mvc;

public class UsuarioController : Controller
{
    public IActionResult Index()
    {
        if (HttpContext.Session.GetString("Perfil") != "Admin")
        {
            return RedirectToAction("Index", "Home");
        }

        return View();
    }
}