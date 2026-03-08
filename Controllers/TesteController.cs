using Microsoft.AspNetCore.Mvc;

namespace SyncStock.Controllers;

public class TesteController : Controller
{
    // tem que referenciar cada pagina no controller seguindo o padrão nome : controller igual no JAVAFX 
    public IActionResult Index()
    {
        return View();
    }

}