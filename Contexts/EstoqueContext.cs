using Microsoft.EntityFrameworkCore;
using SyncStock.Models;


namespace SyncStock.Contexts;
public class EstoqueContext : DbContext
{
    public EstoqueContext(DbContextOptions<EstoqueContext> options) : base(options)
    {
    }

    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Produto> Produtos { get; set; }
    public DbSet<Movimentacao> Movimentacoes { get; set; }
}