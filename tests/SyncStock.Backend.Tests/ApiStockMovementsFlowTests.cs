using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SyncStock.Backend.Tests.Infrastructure;
using SyncStock.Contexts;
using SyncStock.Models;

namespace SyncStock.Backend.Tests;

public sealed class ApiStockMovementsFlowTests : IClassFixture<SyncStockWebApplicationFactory>
{
    private readonly SyncStockWebApplicationFactory _factory;

    public ApiStockMovementsFlowTests(SyncStockWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Stock_movement_endpoint_requires_an_authenticated_user()
    {
        await SeedProductAsync(quantity: 10);
        using var client = _factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });

        var response = await client.PostAsJsonAsync("/api/stock-movements", new
        {
            productId = 1,
            type = "Entrada",
            quantity = 1,
            date = DateTime.Today,
            observation = "Reposicao"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Entry_movement_increases_stock_and_records_the_movement()
    {
        var product = await SeedProductAsync(quantity: 10);
        using var client = await CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/stock-movements", new
        {
            productId = product.Id,
            type = "Entrada",
            quantity = 7,
            date = new DateTime(2026, 4, 29),
            observation = "Compra de reposicao"
        });
        var payload = await response.Content.ReadFromJsonAsync<ApiStockMovementResponse>();

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(payload);
        Assert.Equal("Entrada", payload!.Type);
        Assert.Equal(17, payload.ResultingStock);

        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<EstoqueContext>();
        var persistedProduct = await context.Produtos.SingleAsync(item => item.Id == product.Id);
        var persistedMovement = await context.Movimentacoes.SingleAsync();

        Assert.Equal(17, persistedProduct.QuantidadeEstoque);
        Assert.Equal("Entrada", persistedMovement.Tipo);
        Assert.Equal(7, persistedMovement.Quantidade);
    }

    [Fact]
    public async Task Exit_movement_decreases_stock_and_records_the_movement()
    {
        var product = await SeedProductAsync(quantity: 10);
        using var client = await CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/stock-movements", new
        {
            productId = product.Id,
            type = "Saida",
            quantity = 4,
            date = new DateTime(2026, 4, 29),
            observation = "Venda"
        });
        var payload = await response.Content.ReadFromJsonAsync<ApiStockMovementResponse>();

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(payload);
        Assert.Equal("Saida", payload!.Type);
        Assert.Equal(6, payload.ResultingStock);

        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<EstoqueContext>();
        var persistedProduct = await context.Produtos.SingleAsync(item => item.Id == product.Id);
        var persistedMovement = await context.Movimentacoes.SingleAsync();

        Assert.Equal(6, persistedProduct.QuantidadeEstoque);
        Assert.Equal("Saida", persistedMovement.Tipo);
        Assert.Equal(4, persistedMovement.Quantidade);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-3)]
    public async Task Stock_movement_rejects_non_positive_quantities(int quantity)
    {
        var product = await SeedProductAsync(quantity: 10);
        using var client = await CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/stock-movements", new
        {
            productId = product.Id,
            type = "Saida",
            quantity,
            date = new DateTime(2026, 4, 29),
            observation = "Quantidade invalida"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<EstoqueContext>();
        var persistedProduct = await context.Produtos.SingleAsync(item => item.Id == product.Id);

        Assert.Equal(10, persistedProduct.QuantidadeEstoque);
        Assert.Empty(context.Movimentacoes);
    }

    [Fact]
    public async Task Exit_movement_rejects_quantities_above_available_stock()
    {
        var product = await SeedProductAsync(quantity: 10);
        using var client = await CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/stock-movements", new
        {
            productId = product.Id,
            type = "Saida",
            quantity = 11,
            date = new DateTime(2026, 4, 29),
            observation = "Venda acima do estoque"
        });
        var payload = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("Estoque insuficiente", payload, StringComparison.OrdinalIgnoreCase);

        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<EstoqueContext>();
        var persistedProduct = await context.Produtos.SingleAsync(item => item.Id == product.Id);

        Assert.Equal(10, persistedProduct.QuantidadeEstoque);
        Assert.Empty(context.Movimentacoes);
    }

    [Fact]
    public async Task Stock_movement_rejects_inactive_products()
    {
        var product = await SeedProductAsync(quantity: 10, active: false);
        using var client = await CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/stock-movements", new
        {
            productId = product.Id,
            type = "Entrada",
            quantity = 2,
            date = new DateTime(2026, 4, 29),
            observation = "Produto inativo"
        });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Concurrent_exit_movements_do_not_make_stock_negative()
    {
        var product = await SeedProductAsync(quantity: 5);
        using var firstClient = await CreateAuthenticatedClientAsync();
        using var secondClient = await CreateAuthenticatedClientAsync();

        var responses = await Task.WhenAll(
            firstClient.PostAsJsonAsync("/api/stock-movements", new
            {
                productId = product.Id,
                type = "Saida",
                quantity = 4,
                date = new DateTime(2026, 4, 29),
                observation = "Venda concorrente 1"
            }),
            secondClient.PostAsJsonAsync("/api/stock-movements", new
            {
                productId = product.Id,
                type = "Saida",
                quantity = 4,
                date = new DateTime(2026, 4, 29),
                observation = "Venda concorrente 2"
            }));

        Assert.Contains(responses, response => response.StatusCode == HttpStatusCode.Created);
        Assert.Contains(responses, response => response.StatusCode == HttpStatusCode.BadRequest);

        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<EstoqueContext>();
        var persistedProduct = await context.Produtos.SingleAsync(item => item.Id == product.Id);

        Assert.Equal(1, persistedProduct.QuantidadeEstoque);
        Assert.Equal(1, await context.Movimentacoes.CountAsync());
    }

    private async Task<Produto> SeedProductAsync(int quantity, bool active = true)
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<EstoqueContext>();

        context.Movimentacoes.RemoveRange(context.Movimentacoes);
        context.Produtos.RemoveRange(context.Produtos);
        await context.SaveChangesAsync();

        var product = new Produto
        {
            Codigo = "PF-001",
            Nome = "Pastilha de Freio Dianteira",
            Categoria = "Freios",
            Marca = "Bosch",
            Fornecedor = "Distribuidora Nacional",
            Preco = 89.90m,
            QuantidadeEstoque = quantity,
            EstoqueMinimo = 2,
            Ativo = active
        };

        context.Produtos.Add(product);
        await context.SaveChangesAsync();
        return product;
    }

    private async Task<HttpClient> CreateAuthenticatedClientAsync()
    {
        var client = _factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });

        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new
        {
            login = "admin",
            senha = "admin123"
        });

        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);
        return client;
    }

    private sealed record ApiStockMovementResponse(
        int Id,
        int ProductId,
        string ProductName,
        string Type,
        int Quantity,
        DateTime Date,
        string Observation,
        int ResultingStock);
}
