using System.Net;
using System.Net.Http.Json;
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

    private sealed record ApiCurrentUserResponse(string Nome, string Login, string Perfil);
}
