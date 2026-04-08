using System.Diagnostics;
using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using SyncStock.Backend.Tests.Infrastructure;
using SyncStock.Contexts;
using SyncStock.Models;

namespace SyncStock.Backend.Tests;

public sealed class ApiProductsFlowTests : IClassFixture<SyncStockWebApplicationFactory>
{
    private readonly SyncStockWebApplicationFactory _factory;

    public ApiProductsFlowTests(SyncStockWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Products_endpoint_requires_an_authenticated_user()
    {
        using var client = _factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });

        var response = await client.GetAsync("/api/products");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Products_endpoint_returns_only_active_products_for_authenticated_users()
    {
        await SeedProductsAsync(
        [
            new Produto
            {
                Codigo = "AT-001",
                Nome = "Amortecedor Traseiro",
                Categoria = "Suspensao",
                Marca = "Cofap",
                Fornecedor = "Auto Pecas Brasil",
                Preco = 100,
                QuantidadeEstoque = 12,
                EstoqueMinimo = 5,
                Ativo = true
            },
            new Produto
            {
                Codigo = "IN-001",
                Nome = "Item Inativo",
                Categoria = "Motor",
                Marca = "Bosch",
                Fornecedor = "Distribuidora Nacional",
                Preco = 80,
                QuantidadeEstoque = 4,
                EstoqueMinimo = 2,
                Ativo = false
            }
        ]);

        using var client = await CreateAuthenticatedClientAsync();

        var response = await client.GetAsync("/api/products");
        var payload = await response.Content.ReadFromJsonAsync<List<ApiProductResponse>>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(payload);
        Assert.Single(payload!);
        Assert.Equal("AT-001", payload[0].Codigo);
        Assert.Equal("Amortecedor Traseiro", payload[0].Nome);
        Assert.Equal("Normal", payload[0].StatusEstoque);
    }

    [Fact]
    public async Task Create_product_endpoint_persists_a_new_active_product()
    {
        await SeedProductsAsync([]);
        using var client = await CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/products", new
        {
            codigo = "PF-001",
            nome = "Pastilha de Freio Dianteira",
            categoria = "Freios",
            marca = "Bosch",
            fornecedor = "Distribuidora Nacional",
            preco = 89.90m,
            quantidadeEstoque = 18,
            estoqueMinimo = 10
        });
        var rawPayload = await response.Content.ReadAsStringAsync();

        Assert.True(
            response.StatusCode == HttpStatusCode.Created,
            $"Expected 201 Created, but got {(int)response.StatusCode} with body: {rawPayload}");

        var payload = await response.Content.ReadFromJsonAsync<ApiProductResponse>();
        Assert.NotNull(payload);
        Assert.Equal("PF-001", payload!.Codigo);
        Assert.Equal("Normal", payload.StatusEstoque);

        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<EstoqueContext>();
        var persisted = context.Produtos.Single(p => p.Codigo == "PF-001");

        Assert.True(persisted.Ativo);
        Assert.Equal(18, persisted.QuantidadeEstoque);
    }

    [Fact]
    public async Task Create_product_endpoint_rejects_duplicate_codes()
    {
        await SeedProductsAsync(
        [
            new Produto
            {
                Codigo = "PF-001",
                Nome = "Pastilha Existente",
                Categoria = "Freios",
                Marca = "Bosch",
                Fornecedor = "Distribuidora Nacional",
                Preco = 99,
                QuantidadeEstoque = 10,
                EstoqueMinimo = 5,
                Ativo = true
            }
        ]);

        using var client = await CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/products", new
        {
            codigo = "pf-001",
            nome = "Pastilha Duplicada",
            categoria = "Freios",
            marca = "Bosch",
            fornecedor = "Distribuidora Nacional",
            preco = 120m,
            quantidadeEstoque = 10,
            estoqueMinimo = 5
        });
        var payload = await response.Content.ReadAsStringAsync();

        Assert.True(
            response.StatusCode == HttpStatusCode.Conflict,
            $"Expected 409 Conflict, but got {(int)response.StatusCode} with body: {payload}");
        Assert.Contains("codigo", payload, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Products_endpoint_handles_a_small_burst_without_failing_or_slowing_excessively()
    {
        await SeedProductsAsync(
            Enumerable.Range(1, 25).Select(index => new Produto
            {
                Codigo = $"PR-{index:000}",
                Nome = $"Produto {index:000}",
                Categoria = "Motor",
                Marca = "Bosch",
                Fornecedor = "Distribuidora Nacional",
                Preco = 10 + index,
                QuantidadeEstoque = 20 + index,
                EstoqueMinimo = 5,
                Ativo = true
            }).ToArray());

        var stopwatch = Stopwatch.StartNew();

        var responses = await Task.WhenAll(
            Enumerable.Range(0, 20).Select(async _ =>
            {
                using var client = await CreateAuthenticatedClientAsync();
                return await client.GetAsync("/api/products");
            }));

        stopwatch.Stop();

        Assert.All(responses, response => Assert.Equal(HttpStatusCode.OK, response.StatusCode));
        Assert.True(
            stopwatch.Elapsed < TimeSpan.FromSeconds(5),
            $"Expected the products api burst to complete in under 5 seconds, but it took {stopwatch.Elapsed.TotalMilliseconds:F0}ms.");
    }

    private async Task SeedProductsAsync(IEnumerable<Produto> products)
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<EstoqueContext>();

        context.Produtos.RemoveRange(context.Produtos);
        await context.SaveChangesAsync();

        context.Produtos.AddRange(products);
        await context.SaveChangesAsync();
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

    private sealed record ApiProductResponse(
        int Id,
        string Codigo,
        string Nome,
        string Categoria,
        string Marca,
        string Fornecedor,
        decimal Preco,
        int QuantidadeEstoque,
        int EstoqueMinimo,
        string StatusEstoque);
}
