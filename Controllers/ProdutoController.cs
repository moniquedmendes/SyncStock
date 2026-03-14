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



        public IActionResult Produtos()
        {
            var produtos = _context.Produtos.ToList();
            return View(produtos);
        }
        public IActionResult Inativar(int id)
        {
            var produto = _context.Produtos.Find(id);

            if (produto != null)
            {
                _context.Produtos.Remove(produto);
                _context.SaveChanges();
            }

            return RedirectToAction("Index");
        }

        public IActionResult Edit(int id)
        {
            var produto = _context.Produtos.Find(id);
            return View(produto);
        }

        [HttpPost]
        public IActionResult Edit(Produto produto)
        {
            _context.Produtos.Update(produto);
            _context.SaveChanges();

            return RedirectToAction("Produtos");
        }
    }
}