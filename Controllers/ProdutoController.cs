using Microsoft.AspNetCore.Mvc;
using SyncStock.Contexts;
using SyncStock.Models;

namespace SyncStock.Controllers
{
    public class ProdutoController : Controller
    {
        private readonly EstoqueContext _context;

        public ProdutoController(EstoqueContext context)
        {
            _context = context;
        }

        public IActionResult Cadastro()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Cadastro(Produto produto)
        {
            _context.Produtos.Add(produto);
            _context.SaveChanges();

            return RedirectToAction("Index", "Home");
        }
    }
}