using SyncStock.Contracts.Products;

namespace SyncStock.Services.Products;

public interface IProductService
{
    Task<IReadOnlyList<ProductResponse>> GetActiveProductsAsync(CancellationToken cancellationToken = default);
    Task<ProductResponse?> GetActiveProductByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<CreateProductResult> CreateProductAsync(CreateProductRequest request, CancellationToken cancellationToken = default);
}

public sealed record CreateProductResult(bool IsDuplicateCodigo, ProductResponse? Product);
