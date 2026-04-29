using Microsoft.AspNetCore.Mvc;
using SyncStock.Contexts;
using SyncStock.Contracts.StockMovements;
using SyncStock.Services.StockMovements;

namespace SyncStock.Controllers
{
    public class MovimentacaoController : Controller
    {
        private readonly EstoqueContext _context;
        private readonly IStockMovementService _stockMovementService;

        public MovimentacaoController(
            EstoqueContext context,
            IStockMovementService stockMovementService)
        {
            _context = context;
            _stockMovementService = stockMovementService;
        }

        public IActionResult Venda()
        {
            ViewBag.Produtos = _context.Produtos
                .Where(p => p.Ativo)
                .ToList();

            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Venda(int produtoId, int quantidade)
        {
            var result = await _stockMovementService.CreateMovementAsync(
                new CreateStockMovementRequest(
                    produtoId,
                    "Saida",
                    quantidade,
                    DateTime.Now,
                    "Venda realizada"));

            if (!result.Succeeded)
            {
                TempData["Erro"] = ToUserMessage(result.Error);
                return RedirectToAction("Venda");
            }

            return RedirectToAction("Produtos", "Produto");
        }

        private static string ToUserMessage(StockMovementError error)
        {
            return error switch
            {
                StockMovementError.InvalidQuantity => "Quantidade deve ser maior que zero.",
                StockMovementError.InsufficientStock => "Estoque insuficiente!",
                StockMovementError.ProductNotFound => "Produto nao encontrado ou inativo.",
                _ => "Nao foi possivel registrar a movimentacao."
            };
        }
    }
}
