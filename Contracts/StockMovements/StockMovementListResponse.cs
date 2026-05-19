namespace SyncStock.Contracts.StockMovements;

public sealed record StockMovementListResponse(
    IReadOnlyList<StockMovementHistoryItemResponse> Items,
    int Page,
    int PageSize,
    int TotalCount,
    int TotalPages);
