using System.Net;
using SyncStock.Backend.Tests.Infrastructure;

namespace SyncStock.Backend.Tests;

public sealed class AuthFlowTests : IClassFixture<SyncStockWebApplicationFactory>
{
    private readonly SyncStockWebApplicationFactory _factory;

    public AuthFlowTests(SyncStockWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Home_index_redirects_to_login_when_session_is_missing()
    {
        using var client = _factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });

        var response = await client.GetAsync("/Home/Index");

        Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
        Assert.NotNull(response.Headers.Location);
        var location = response.Headers.Location!.OriginalString;
        Assert.True(
            location == "/" || location.Contains("/Auth/Login"),
            $"Expected a redirect to the login route, but got '{location}'.");
    }

    [Fact]
    public async Task Login_with_seeded_admin_sets_session_and_reaches_home()
    {
        using var client = _factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });

        using var form = new FormUrlEncodedContent(
        [
            new KeyValuePair<string, string>("login", "admin"),
            new KeyValuePair<string, string>("senha", "admin123")
        ]);

        var loginResponse = await client.PostAsync("/Auth/Login", form);

        Assert.Equal(HttpStatusCode.Redirect, loginResponse.StatusCode);
        Assert.NotNull(loginResponse.Headers.Location);
        Assert.Contains("/Home", loginResponse.Headers.Location!.OriginalString);

        var homeResponse = await client.GetAsync("/Home/Index");

        Assert.Equal(HttpStatusCode.OK, homeResponse.StatusCode);
        Assert.Contains("text/html", homeResponse.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task Invalid_login_keeps_user_on_login_page_with_error_message()
    {
        using var client = _factory.CreateClient();
        using var form = new FormUrlEncodedContent(
        [
            new KeyValuePair<string, string>("login", "admin"),
            new KeyValuePair<string, string>("senha", "wrong-password")
        ]);

        var response = await client.PostAsync("/Auth/Login", form);
        var html = WebUtility.HtmlDecode(await response.Content.ReadAsStringAsync());

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("Usuário ou senha inválidos", html);
    }
}
