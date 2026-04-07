using System.Net;
using System.Net.Http.Json;
using System.Diagnostics;
using SyncStock.Backend.Tests.Infrastructure;

namespace SyncStock.Backend.Tests;

public sealed class ApiAuthFlowTests : IClassFixture<SyncStockWebApplicationFactory>
{
    private readonly SyncStockWebApplicationFactory _factory;

    public ApiAuthFlowTests(SyncStockWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Me_endpoint_returns_unauthorized_without_an_authenticated_cookie()
    {
        using var client = _factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });

        var response = await client.GetAsync("/api/auth/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_endpoint_returns_current_user_and_allows_followup_me_request()
    {
        using var client = _factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });

        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new
        {
            login = "admin",
            senha = "admin123"
        });

        var user = await loginResponse.Content.ReadFromJsonAsync<ApiCurrentUserResponse>();

        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);
        Assert.NotNull(user);
        Assert.Equal("Administrador", user!.Nome);
        Assert.Equal("admin", user.Login);
        Assert.Equal("Admin", user.Perfil);

        var meResponse = await client.GetAsync("/api/auth/me");
        var currentUser = await meResponse.Content.ReadFromJsonAsync<ApiCurrentUserResponse>();

        Assert.Equal(HttpStatusCode.OK, meResponse.StatusCode);
        Assert.NotNull(currentUser);
        Assert.Equal("admin", currentUser!.Login);
    }

    [Fact]
    public async Task Invalid_login_returns_unauthorized_problem_response()
    {
        using var client = _factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });

        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            login = "admin",
            senha = "invalid"
        });
        var payload = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Contains("invalid", payload, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Logout_endpoint_revokes_the_authenticated_session()
    {
        using var client = _factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });

        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new
        {
            login = "admin",
            senha = "admin123"
        });

        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        var logoutResponse = await client.PostAsync("/api/auth/logout", content: null);
        var meResponse = await client.GetAsync("/api/auth/me");

        Assert.Equal(HttpStatusCode.NoContent, logoutResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, meResponse.StatusCode);
    }

    [Fact]
    public async Task Login_endpoint_handles_a_small_burst_without_failing_or_slowing_excessively()
    {
        var stopwatch = Stopwatch.StartNew();

        var responses = await Task.WhenAll(
            Enumerable.Range(0, 20).Select(async _ =>
            {
                using var client = _factory.CreateClient(new WebApplicationFactoryClientOptions
                {
                    AllowAutoRedirect = false
                });

                return await client.PostAsJsonAsync("/api/auth/login", new
                {
                    login = "admin",
                    senha = "admin123"
                });
            }));

        stopwatch.Stop();

        Assert.All(responses, response => Assert.Equal(HttpStatusCode.OK, response.StatusCode));
        Assert.True(
            stopwatch.Elapsed < TimeSpan.FromSeconds(5),
            $"Expected the auth api burst to complete in under 5 seconds, but it took {stopwatch.Elapsed.TotalMilliseconds:F0}ms.");
    }

    private sealed record ApiCurrentUserResponse(string Nome, string Login, string Perfil);
}
