namespace SyncStock.Models;
public class Produto
{
    public int Id { get; set; }
    public string Codigo { get; set; }
    public string Nome { get; set; }
    public string Categoria { get; set; }
    public string Marca { get; set; }
    public string Fornecedor { get; set; }
    public decimal Preco { get; set; }
    public int QuantidadeEstoque { get; set; }
    public int EstoqueMinimo { get; set; }
    public bool Ativo { get; set; }
}