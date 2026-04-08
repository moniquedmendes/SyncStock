namespace SyncStock.Contracts.Products;

public sealed record ProductResponse(
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
