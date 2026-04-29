namespace SyncStock.Contracts.StockMovements;

public sealed record StockMovementResponse(
    int Id,
    int ProductId,
    string ProductName,
    string Type,
    int Quantity,
    DateTime Date,
    string Observation,
    int ResultingStock);
