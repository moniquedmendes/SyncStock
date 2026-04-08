using System.ComponentModel.DataAnnotations;

namespace SyncStock.Contracts.Products;

public sealed class CreateProductRequest
{
    [Required]
    [StringLength(50, MinimumLength = 2)]
    public string Codigo { get; init; } = string.Empty;

    [Required]
    [StringLength(120, MinimumLength = 3)]
    public string Nome { get; init; } = string.Empty;

    [Required]
    [StringLength(80, MinimumLength = 2)]
    public string Categoria { get; init; } = string.Empty;

    [Required]
    [StringLength(80, MinimumLength = 2)]
    public string Marca { get; init; } = string.Empty;

    [Required]
    [StringLength(120, MinimumLength = 2)]
    public string Fornecedor { get; init; } = string.Empty;

    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
    public decimal Preco { get; init; }

    [Range(0, int.MaxValue)]
    public int QuantidadeEstoque { get; init; }

    [Range(0, int.MaxValue)]
    public int EstoqueMinimo { get; init; }
}
