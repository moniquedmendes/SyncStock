using SyncStock.Contracts.StockMovements;

namespace SyncStock.Services.StockMovements;

public interface IStockMovementService
{
    Task<StockMovementResult> CreateMovementAsync(
        CreateStockMovementRequest request,
        CancellationToken cancellationToken = default);

    Task<StockMovementListResponse> ListMovementsAsync(
        StockMovementQuery query,
        CancellationToken cancellationToken = default);
}

public sealed record StockMovementResult(
    StockMovementError Error,
    StockMovementResponse? Movement = null)
{
    public bool Succeeded => Error == StockMovementError.None;
}

public enum StockMovementError
{
    None,
    InvalidType,
    InvalidQuantity,
    ProductNotFound,
    InsufficientStock
}
