namespace SyncStock.Contracts.Dashboard;

public sealed record DashboardSummaryResponse(
    int TotalProducts,
    int LowStockProducts,
    int MonthlyMovementCount,
    int ActiveSuppliers,
    int TotalStockItems,
    decimal TotalStockValue,
    decimal AverageMovementsPerDay,
    IReadOnlyList<DashboardMovementResponse> RecentMovements,
    IReadOnlyList<DashboardMonthlyMovementResponse> MonthlyMovements,
    IReadOnlyList<DashboardCategoryStockResponse> CategoryStock);

public sealed record DashboardMovementResponse(
    int Id,
    int ProductId,
    string ProductCode,
    string ProductName,
    string Type,
    int Quantity,
    DateTime Date,
    string Observation);

public sealed record DashboardMonthlyMovementResponse(
    string Month,
    int Entries,
    int Exits);

public sealed record DashboardCategoryStockResponse(
    string Category,
    int Quantity);
