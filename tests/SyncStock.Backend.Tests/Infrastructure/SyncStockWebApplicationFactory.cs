using System.Data.Common;
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
    private DbConnection? _connection;

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

            var dbConnectionDescriptor = services.SingleOrDefault(
                descriptor => descriptor.ServiceType == typeof(DbConnection));
            if (dbConnectionDescriptor is not null)
            {
                services.Remove(dbConnectionDescriptor);
            }

            _connection = new SqliteConnection("DataSource=:memory:");
            _connection.Open();

            services.AddSingleton(_connection);
            services.AddDbContext<EstoqueContext>((serviceProvider, options) =>
                options.UseSqlite(serviceProvider.GetRequiredService<DbConnection>()));

            using var scope = services.BuildServiceProvider().CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<EstoqueContext>();
            context.Database.EnsureCreated();
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing)
        {
            _connection?.Dispose();
        }
    }
}
