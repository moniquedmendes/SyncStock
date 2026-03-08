using Microsoft.AspNetCore.Mvc;

namespace SyncStock.Controllers;

public class ProdutoController : Controller
{

    public IActionResult Cadastro()
    {
        return View();
    }

}