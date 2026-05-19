using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SyncStock.Backend.Tests.Infrastructure;
using SyncStock.Contexts;
using SyncStock.Models;

namespace SyncStock.Backend.Tests;

public sealed class ApiStockMovementHistoryFlowTests : IClassFixture<SyncStockWebApplicationFactory>
{
    private readonly SyncStockWebApplicationFactory _factory;

    public ApiStockMovementHistoryFlowTests(SyncStockWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Stock_movement_history_requires_an_authenticated_user()
    {
        using var client = _factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });

        var response = await client.GetAsync("/api/stock-movements");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Stock_movement_history_returns_latest_movements_with_paging()
    {
        await SeedHistoryDataAsync();
        using var client = await CreateAuthenticatedClientAsync();

        var response = await client.GetAsync("/api/stock-movements?page=1&pageSize=2");
        var payload = await response.Content.ReadFromJsonAsync<ApiStockMovementListResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(payload);
        Assert.Equal(1, payload!.Page);
        Assert.Equal(2, payload.PageSize);
        Assert.Equal(3, payload.TotalCount);
        Assert.Equal(2, payload.TotalPages);

        Assert.Collection(
            payload.Items,
            item =>
            {
                Assert.Equal("Saida", item.Type);
                Assert.Equal("Filtro de Oleo Motor", item.ProductName);
                Assert.Equal("FO-002", item.ProductCode);
            },
            item =>
            {
                Assert.Equal("Entrada", item.Type);
                Assert.Equal("Pastilha de Freio Dianteira", item.ProductName);
                Assert.Equal("PF-001", item.ProductCode);
            });
    }

    [Fact]
    public async Task Stock_movement_history_filters_by_type_product_and_period()
    {
        var (brakePadId, _) = await SeedHistoryDataAsync();
        using var client = await CreateAuthenticatedClientAsync();

        var response = await client.GetAsync(
            $"/api/stock-movements?type=Entrada&productId={brakePadId}&from=2026-04-01&to=2026-04-30");
        var payload = await response.Content.ReadFromJsonAsync<ApiStockMovementListResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(payload);
        var item = Assert.Single(payload!.Items);
        Assert.Equal(brakePadId, item.ProductId);
        Assert.Equal("Entrada", item.Type);
        Assert.Equal(7, item.Quantity);
        Assert.Equal("Reposicao", item.Observation);
    }

    private async Task<(int BrakePadId, int OilFilterId)> SeedHistoryDataAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<EstoqueContext>();

        context.Movimentacoes.RemoveRange(context.Movimentacoes);
        context.Produtos.RemoveRange(context.Produtos);
        await context.SaveChangesAsync();

        var brakePad = new Produto
        {
            Codigo = "PF-001",
            Nome = "Pastilha de Freio Dianteira",
            Categoria = "Freios",
            Marca = "Bosch",
            Fornecedor = "Distribuidora Nacional",
            Preco = 89.90m,
            QuantidadeEstoque = 18,
            EstoqueMinimo = 10,
            Ativo = true
        };
        var oilFilter = new Produto
        {
            Codigo = "FO-002",
            Nome = "Filtro de Oleo Motor",
            Categoria = "Motor",
            Marca = "Mahle",
            Fornecedor = "Auto Pecas Brasil",
            Preco = 19.50m,
            QuantidadeEstoque = 4,
            EstoqueMinimo = 10,
            Ativo = true
        };

        context.Produtos.AddRange(brakePad, oilFilter);
        await context.SaveChangesAsync();

        context.Movimentacoes.AddRange(
            new Movimentacao
            {
                ProdutoId = oilFilter.Id,
                Tipo = "Entrada",
                Quantidade = 12,
                Data = new DateTime(2026, 3, 28),
                Observacao = "Compra anterior"
            },
            new Movimentacao
            {
                ProdutoId = brakePad.Id,
                Tipo = "Entrada",
                Quantidade = 7,
                Data = new DateTime(2026, 4, 10),
                Observacao = "Reposicao"
            },
            new Movimentacao
            {
                ProdutoId = oilFilter.Id,
                Tipo = "Saida",
                Quantidade = 3,
                Data = new DateTime(2026, 4, 12),
                Observacao = "Venda"
            });
        await context.SaveChangesAsync();

        return (brakePad.Id, oilFilter.Id);
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

    private sealed record ApiStockMovementListResponse(
        IReadOnlyList<ApiStockMovementHistoryItemResponse> Items,
        int Page,
        int PageSize,
        int TotalCount,
        int TotalPages);

    private sealed record ApiStockMovementHistoryItemResponse(
        int Id,
        int ProductId,
        string ProductCode,
        string ProductName,
        string Type,
        int Quantity,
        DateTime Date,
        string Observation);
}
