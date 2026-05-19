using Microsoft.EntityFrameworkCore;
using SyncStock.Contexts;
using SyncStock.Contracts.StockMovements;
using SyncStock.Models;

namespace SyncStock.Services.StockMovements;

public sealed class StockMovementService : IStockMovementService
{
    private const string EntryType = "Entrada";
    private const string ExitType = "Saida";
    private readonly EstoqueContext _context;

    public StockMovementService(EstoqueContext context)
    {
        _context = context;
    }

    public async Task<StockMovementResult> CreateMovementAsync(
        CreateStockMovementRequest request,
        CancellationToken cancellationToken = default)
    {
        var movementType = NormalizeType(request.Type);
        if (movementType is null)
        {
            return new StockMovementResult(StockMovementError.InvalidType);
        }

        if (request.Quantity <= 0)
        {
            return new StockMovementResult(StockMovementError.InvalidQuantity);
        }

        var product = await _context.Produtos
            .AsNoTracking()
            .Where(item => item.Id == request.ProductId && item.Ativo)
            .Select(item => new ProductSnapshot(item.Id, item.Nome, item.QuantidadeEstoque))
            .SingleOrDefaultAsync(cancellationToken);

        if (product is null)
        {
            return new StockMovementResult(StockMovementError.ProductNotFound);
        }

        if (movementType == ExitType && product.Stock < request.Quantity)
        {
            return new StockMovementResult(StockMovementError.InsufficientStock);
        }

        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        var affectedRows = await ApplyStockChangeAsync(
            product.Id,
            movementType,
            request.Quantity,
            cancellationToken);

        if (affectedRows == 0)
        {
            await transaction.RollbackAsync(cancellationToken);
            var stillActive = await _context.Produtos
                .AnyAsync(item => item.Id == product.Id && item.Ativo, cancellationToken);

            return new StockMovementResult(
                stillActive ? StockMovementError.InsufficientStock : StockMovementError.ProductNotFound);
        }

        var resultingStock = await _context.Produtos
            .Where(item => item.Id == product.Id)
            .Select(item => item.QuantidadeEstoque)
            .SingleAsync(cancellationToken);

        var movement = new Movimentacao
        {
            ProdutoId = product.Id,
            Tipo = movementType,
            Quantidade = request.Quantity,
            Data = request.Date == default ? DateTime.Now : request.Date,
            Observacao = request.Observation?.Trim() ?? string.Empty
        };

        _context.Movimentacoes.Add(movement);
        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return new StockMovementResult(
            StockMovementError.None,
            new StockMovementResponse(
                movement.Id,
                product.Id,
                product.Name,
                movement.Tipo,
                movement.Quantidade,
                movement.Data,
                movement.Observacao,
                resultingStock));
    }

    private async Task<int> ApplyStockChangeAsync(
        int productId,
        string movementType,
        int quantity,
        CancellationToken cancellationToken)
    {
        if (movementType == EntryType)
        {
            return await _context.Produtos
                .Where(item => item.Id == productId && item.Ativo)
                .ExecuteUpdateAsync(
                    setters => setters.SetProperty(
                        item => item.QuantidadeEstoque,
                        item => item.QuantidadeEstoque + quantity),
                    cancellationToken);
        }

        return await _context.Produtos
            .Where(item => item.Id == productId && item.Ativo && item.QuantidadeEstoque >= quantity)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(
                    item => item.QuantidadeEstoque,
                    item => item.QuantidadeEstoque - quantity),
                cancellationToken);
    }

    private static string? NormalizeType(string? type)
    {
        return type?.Trim().ToLowerInvariant() switch
        {
            "entrada" => EntryType,
            "entry" => EntryType,
            "saida" => ExitType,
            "saída" => ExitType,
            "exit" => ExitType,
            _ => null
        };
    }

    private sealed record ProductSnapshot(int Id, string Name, int Stock);
}
