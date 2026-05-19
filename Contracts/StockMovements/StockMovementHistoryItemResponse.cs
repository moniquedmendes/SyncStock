namespace SyncStock.Contracts.StockMovements;

public sealed record StockMovementHistoryItemResponse(
    int Id,
    int ProductId,
    string ProductCode,
    string ProductName,
    string Type,
    int Quantity,
    DateTime Date,
    string Observation);
