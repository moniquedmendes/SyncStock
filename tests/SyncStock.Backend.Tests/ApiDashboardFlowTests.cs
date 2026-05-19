using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SyncStock.Backend.Tests.Infrastructure;
using SyncStock.Contexts;
using SyncStock.Models;

namespace SyncStock.Backend.Tests;

public sealed class ApiDashboardFlowTests : IClassFixture<SyncStockWebApplicationFactory>
{
    private readonly SyncStockWebApplicationFactory _factory;

    public ApiDashboardFlowTests(SyncStockWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Dashboard_summary_requires_an_authenticated_user()
    {
        using var client = _factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });

        var response = await client.GetAsync("/api/dashboard/summary");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Dashboard_summary_returns_real_stock_and_movement_indicators()
    {
        var today = DateTime.Today;
        await SeedDashboardDataAsync(today);
        using var client = await CreateAuthenticatedClientAsync();

        var response = await client.GetAsync("/api/dashboard/summary");
        var payload = await response.Content.ReadFromJsonAsync<ApiDashboardSummaryResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(payload);
        Assert.Equal(2, payload!.TotalProducts);
        Assert.Equal(1, payload.LowStockProducts);
        Assert.Equal(2, payload.MonthlyMovementCount);
        Assert.Equal(2, payload.ActiveSuppliers);
        Assert.Equal(14, payload.TotalStockItems);
        Assert.Equal(240m, payload.TotalStockValue);
        Assert.Equal(1.5m, payload.AverageMovementsPerDay);

        Assert.Collection(
            payload.RecentMovements,
            item =>
            {
                Assert.Equal("Filtro de Oleo Motor", item.ProductName);
                Assert.Equal("Saida", item.Type);
            },
            item =>
            {
                Assert.Equal("Pastilha de Freio Dianteira", item.ProductName);
                Assert.Equal("Entrada", item.Type);
            },
            item =>
            {
                Assert.Equal("Filtro de Oleo Motor", item.ProductName);
                Assert.Equal("Entrada", item.Type);
            });

        Assert.Contains(payload.CategoryStock, item => item.Category == "Freios" && item.Quantity == 4);
        Assert.Contains(payload.CategoryStock, item => item.Category == "Motor" && item.Quantity == 10);
        Assert.Contains(payload.MonthlyMovements, item => item.Entries == 7 && item.Exits == 3);
    }

    private async Task SeedDashboardDataAsync(DateTime today)
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
            Preco = 10m,
            QuantidadeEstoque = 4,
            EstoqueMinimo = 5,
            Ativo = true
        };
        var oilFilter = new Produto
        {
            Codigo = "FO-002",
            Nome = "Filtro de Oleo Motor",
            Categoria = "Motor",
            Marca = "Mahle",
            Fornecedor = "Auto Pecas Brasil",
            Preco = 20m,
            QuantidadeEstoque = 10,
            EstoqueMinimo = 5,
            Ativo = true
        };
        var inactiveProduct = new Produto
        {
            Codigo = "IN-003",
            Nome = "Produto Inativo",
            Categoria = "Motor",
            Marca = "Sem Marca",
            Fornecedor = "Distribuidora Nacional",
            Preco = 99m,
            QuantidadeEstoque = 99,
            EstoqueMinimo = 1,
            Ativo = false
        };

        context.Produtos.AddRange(brakePad, oilFilter, inactiveProduct);
        await context.SaveChangesAsync();

        context.Movimentacoes.AddRange(
            new Movimentacao
            {
                ProdutoId = brakePad.Id,
                Tipo = "Entrada",
                Quantidade = 7,
                Data = today.AddHours(10),
                Observacao = "Reposicao"
            },
            new Movimentacao
            {
                ProdutoId = oilFilter.Id,
                Tipo = "Saida",
                Quantidade = 3,
                Data = today.AddHours(11),
                Observacao = "Venda"
            },
            new Movimentacao
            {
                ProdutoId = oilFilter.Id,
                Tipo = "Entrada",
                Quantidade = 2,
                Data = today.AddMonths(-1),
                Observacao = "Compra anterior"
            });
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

    private sealed record ApiDashboardSummaryResponse(
        int TotalProducts,
        int LowStockProducts,
        int MonthlyMovementCount,
        int ActiveSuppliers,
        int TotalStockItems,
        decimal TotalStockValue,
        decimal AverageMovementsPerDay,
        IReadOnlyList<ApiDashboardMovementResponse> RecentMovements,
        IReadOnlyList<ApiDashboardMonthlyMovementResponse> MonthlyMovements,
        IReadOnlyList<ApiDashboardCategoryStockResponse> CategoryStock);

    private sealed record ApiDashboardMovementResponse(
        int Id,
        int ProductId,
        string ProductCode,
        string ProductName,
        string Type,
        int Quantity,
        DateTime Date,
        string Observation);

    private sealed record ApiDashboardMonthlyMovementResponse(
        string Month,
        int Entries,
        int Exits);

    private sealed record ApiDashboardCategoryStockResponse(
        string Category,
        int Quantity);
}
