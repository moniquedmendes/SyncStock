using Microsoft.EntityFrameworkCore;
using SyncStock.Contexts;
using SyncStock.Contracts.Products;
using SyncStock.Models;

namespace SyncStock.Services.Products;

public sealed class ProductService : IProductService
{
    private readonly EstoqueContext _context;

    public ProductService(EstoqueContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<ProductResponse>> GetActiveProductsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Produtos
            .AsNoTracking()
            .Where(product => product.Ativo)
            .OrderBy(product => product.Nome)
            .Select(product => ToResponse(product))
            .ToListAsync(cancellationToken);
    }

    public async Task<ProductResponse?> GetActiveProductByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Produtos
            .AsNoTracking()
            .Where(product => product.Ativo && product.Id == id)
            .Select(product => ToResponse(product))
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<CreateProductResult> CreateProductAsync(
        CreateProductRequest request,
        CancellationToken cancellationToken = default)
    {
        var normalizedCodigo = request.Codigo.Trim().ToUpperInvariant();

        var duplicateCodigoExists = await _context.Produtos.AnyAsync(
            product => product.Codigo == normalizedCodigo,
            cancellationToken);

        if (duplicateCodigoExists)
        {
            return new CreateProductResult(true, null);
        }

        var product = new Produto
        {
            Codigo = normalizedCodigo,
            Nome = request.Nome.Trim(),
            Categoria = request.Categoria.Trim(),
            Marca = request.Marca.Trim(),
            Fornecedor = request.Fornecedor.Trim(),
            Preco = request.Preco,
            QuantidadeEstoque = request.QuantidadeEstoque,
            EstoqueMinimo = request.EstoqueMinimo,
            Ativo = true
        };

        _context.Produtos.Add(product);
        await _context.SaveChangesAsync(cancellationToken);

        return new CreateProductResult(false, ToResponse(product));
    }

    private static ProductResponse ToResponse(Produto product)
    {
        return new ProductResponse(
            product.Id,
            product.Codigo,
            product.Nome,
            product.Categoria,
            product.Marca,
            product.Fornecedor,
            product.Preco,
            product.QuantidadeEstoque,
            product.EstoqueMinimo,
            product.QuantidadeEstoque <= product.EstoqueMinimo ? "Estoque Baixo" : "Normal");
    }
}
