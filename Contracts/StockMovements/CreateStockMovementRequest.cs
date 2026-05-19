namespace SyncStock.Contracts.StockMovements;

public sealed record CreateStockMovementRequest(
    int ProductId,
    string Type,
    int Quantity,
    DateTime Date,
    string? Observation);
