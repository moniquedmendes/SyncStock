using Microsoft.AspNetCore.Hosting;
using Microsoft.Data.Sqlite;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection.Extensions;
using SyncStock.Contexts;

namespace SyncStock.Backend.Tests.Infrastructure;

public sealed class SyncStockWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _testConnectionString = $"Data Source=syncstock-tests-{Guid.NewGuid():N};Mode=Memory;Cache=Shared";
    private SqliteConnection? _keepAliveConnection;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");

        builder.ConfigureServices(services =>
        {
            var optionsDescriptor = services.SingleOrDefault(
                descriptor => descriptor.ServiceType == typeof(DbContextOptions<EstoqueContext>));
            if (optionsDescriptor is not null)
            {
                services.Remove(optionsDescriptor);
            }

            var dbContextConfigurationDescriptor = services.SingleOrDefault(
                descriptor => descriptor.ServiceType == typeof(IDbContextOptionsConfiguration<EstoqueContext>));
            if (dbContextConfigurationDescriptor is not null)
            {
                services.Remove(dbContextConfigurationDescriptor);
            }

            _keepAliveConnection = new SqliteConnection(_testConnectionString);
            _keepAliveConnection.Open();

            services.AddDbContext<EstoqueContext>(options =>
                options.UseSqlite(_testConnectionString));

            using var scope = services.BuildServiceProvider().CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<EstoqueContext>();
            context.Database.EnsureDeleted();
            context.Database.EnsureCreated();
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing)
        {
            _keepAliveConnection?.Dispose();
        }
    }
}
