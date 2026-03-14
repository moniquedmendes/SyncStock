using Microsoft.AspNetCore.Mvc;
using SyncStock.Contexts;
using SyncStock.Models;

namespace SyncStock.Controllers
{
    public class MovimentacaoController : Controller
    {
        private readonly EstoqueContext _context;

        public MovimentacaoController(EstoqueContext context)
        {
            _context = context;
        }

        public IActionResult Venda()
        {
            ViewBag.Produtos = _context.Produtos
                .Where(p => p.Ativo)
                .ToList();

            return View();
        }

        [HttpPost]
        public IActionResult Venda(int produtoId, int quantidade)
        {
            var produto = _context.Produtos.Find(produtoId);

            if (produto == null)
                return RedirectToAction("Venda");

            if (produto.QuantidadeEstoque < quantidade)
            {
                TempData["Erro"] = "Estoque insuficiente!";
                return RedirectToAction("Venda");
            }

            produto.QuantidadeEstoque -= quantidade;

            var movimentacao = new Movimentacao
            {
                ProdutoId = produtoId,
                Tipo = "Saida",
                Quantidade = quantidade,
                Data = DateTime.Now,
                Observacao = "Venda realizada"
            };

            _context.Movimentacoes.Add(movimentacao);
            _context.SaveChanges();

            return RedirectToAction("Produtos", "Produto");
        }
    }
}