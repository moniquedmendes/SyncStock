using System.Diagnostics;
using System.Net;
using SyncStock.Backend.Tests.Infrastructure;

namespace SyncStock.Backend.Tests;

public sealed class SmokeStabilityTests : IClassFixture<SyncStockWebApplicationFactory>
{
    private readonly SyncStockWebApplicationFactory _factory;

    public SmokeStabilityTests(SyncStockWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Login_page_handles_a_small_burst_without_failing_or_slowing_excessively()
    {
        using var client = _factory.CreateClient();
        var stopwatch = Stopwatch.StartNew();

        var responses = await Task.WhenAll(
            Enumerable.Range(0, 20).Select(_ => client.GetAsync("/Auth/Login")));

        stopwatch.Stop();

        Assert.All(responses, response => Assert.Equal(HttpStatusCode.OK, response.StatusCode));
        Assert.True(
            stopwatch.Elapsed < TimeSpan.FromSeconds(5),
            $"Expected the burst to complete in under 5 seconds, but it took {stopwatch.Elapsed.TotalMilliseconds:F0}ms.");
    }
}
