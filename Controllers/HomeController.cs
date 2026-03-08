using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using SyncStock.Models;

namespace SyncStock.Controllers;

public class HomeController : Controller
{
    public IActionResult Index()
    {
        if (HttpContext.Session.GetString("UsuarioLogado") == null)
        {
            return RedirectToAction("Login", "Auth");
        }

        return View();
    }

    public IActionResult Privacy()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
