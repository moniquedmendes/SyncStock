using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using SyncStock.Contexts;
using SyncStock.Models;
using Microsoft.EntityFrameworkCore;

namespace SyncStock.Controllers;

public class HomeController : Controller
{
    private readonly EstoqueContext _context;

    public HomeController(EstoqueContext context)
    {
        _context = context;
    }

    public IActionResult Index()
    {
        // Últimas vendas
        var vendas = _context.Movimentacoes
            .Include(m => m.Produto)
            .Where(m => m.Tipo == "Saida")
            .OrderByDescending(m => m.Data)
            .Take(5)
            .ToList();

        // Produtos com estoque baixo
        var alertas = _context.Produtos
            .Where(p => p.QuantidadeEstoque <= p.EstoqueMinimo && p.Ativo)
            .ToList();

        ViewBag.Vendas = vendas;
        ViewBag.Alertas = alertas;

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
