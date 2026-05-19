using SyncStock.Contracts.Dashboard;

namespace SyncStock.Services.Dashboard;

public interface IDashboardService
{
    Task<DashboardSummaryResponse> GetSummaryAsync(CancellationToken cancellationToken = default);
}
