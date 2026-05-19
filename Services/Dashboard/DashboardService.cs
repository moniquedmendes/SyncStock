using System.Globalization;
using Microsoft.EntityFrameworkCore;
using SyncStock.Contexts;
using SyncStock.Contracts.Dashboard;

namespace SyncStock.Services.Dashboard;

public sealed class DashboardService : IDashboardService
{
    private readonly EstoqueContext _context;

    public DashboardService(EstoqueContext context)
    {
        _context = context;
    }

    public async Task<DashboardSummaryResponse> GetSummaryAsync(
        CancellationToken cancellationToken = default)
    {
        var activeProducts = await _context.Produtos
            .AsNoTracking()
            .Where(product => product.Ativo)
            .Select(product => new ActiveProductSnapshot(
                product.Categoria,
                product.Fornecedor,
                product.Preco,
                product.QuantidadeEstoque,
                product.EstoqueMinimo))
            .ToListAsync(cancellationToken);

        var monthStart = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
        var monthEnd = monthStart.AddMonths(1);

        var monthlyMovementCount = await _context.Movimentacoes
            .AsNoTracking()
            .CountAsync(
                movement => movement.Data >= monthStart && movement.Data < monthEnd,
                cancellationToken);

        var recentMovements = await _context.Movimentacoes
            .AsNoTracking()
            .Include(movement => movement.Produto)
            .OrderByDescending(movement => movement.Data)
            .ThenByDescending(movement => movement.Id)
            .Take(5)
            .Select(movement => new DashboardMovementResponse(
                movement.Id,
                movement.ProdutoId,
                movement.Produto.Codigo,
                movement.Produto.Nome,
                movement.Tipo,
                movement.Quantidade,
                movement.Data,
                movement.Observacao))
            .ToListAsync(cancellationToken);

        var movementSummaries = await _context.Movimentacoes
            .AsNoTracking()
            .Where(movement => movement.Data >= monthStart.AddMonths(-5))
            .Select(movement => new MovementSummarySnapshot(
                movement.Data,
                movement.Tipo,
                movement.Quantidade))
            .ToListAsync(cancellationToken);

        var movementDates = await _context.Movimentacoes
            .AsNoTracking()
            .Select(movement => movement.Data)
            .ToListAsync(cancellationToken);

        var normalizedMovementDates = movementDates.Select(date => date.Date).ToList();
        var totalMovements = normalizedMovementDates.Count;
        var activeMovementDays = normalizedMovementDates.Distinct().Count();
        var averageMovementsPerDay = activeMovementDays == 0
            ? 0m
            : Math.Round((decimal)totalMovements / activeMovementDays, 2);

        return new DashboardSummaryResponse(
            activeProducts.Count,
            activeProducts.Count(product => product.Stock <= product.MinimumStock),
            monthlyMovementCount,
            activeProducts.Select(product => product.Supplier).Distinct().Count(),
            activeProducts.Sum(product => product.Stock),
            activeProducts.Sum(product => product.Price * product.Stock),
            averageMovementsPerDay,
            recentMovements,
            movementSummaries
                .GroupBy(movement => new { movement.Date.Year, movement.Date.Month })
                .Select(group => new MonthlyMovementSnapshot(
                    group.Key.Year,
                    group.Key.Month,
                    group.Where(movement => movement.Type == "Entrada").Sum(movement => movement.Quantity),
                    group.Where(movement => movement.Type == "Saida").Sum(movement => movement.Quantity)))
                .OrderBy(group => group.Year)
                .ThenBy(group => group.Month)
                .Select(group => new DashboardMonthlyMovementResponse(
                    FormatMonth(group.Year, group.Month),
                    group.Entries,
                    group.Exits))
                .ToList(),
            activeProducts
                .GroupBy(product => product.Category)
                .Select(group => new DashboardCategoryStockResponse(
                    group.Key,
                    group.Sum(product => product.Stock)))
                .OrderBy(group => group.Category)
                .ToList());
    }

    private static string FormatMonth(int year, int month)
    {
        var date = new DateTime(year, month, 1);
        return date.ToString("MMM/yyyy", CultureInfo.GetCultureInfo("pt-BR"));
    }

    private sealed record ActiveProductSnapshot(
        string Category,
        string Supplier,
        decimal Price,
        int Stock,
        int MinimumStock);

    private sealed record MonthlyMovementSnapshot(
        int Year,
        int Month,
        int Entries,
        int Exits);

    private sealed record MovementSummarySnapshot(
        DateTime Date,
        string Type,
        int Quantity);
}
