namespace SyncStock.Contracts.StockMovements;

public sealed record StockMovementQuery(
    int? ProductId,
    string? Type,
    DateTime? From,
    DateTime? To,
    int Page = 1,
    int PageSize = 10);
