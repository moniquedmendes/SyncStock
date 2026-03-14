namespace SyncStock.Models;
public class Movimentacao
{
    public int Id { get; set; }

    public int ProdutoId { get; set; }
    public Produto Produto { get; set; }

    public string Tipo { get; set; } // Entrada ou Saida
    public int Quantidade { get; set; }

    public DateTime Data { get; set; }

    public string Observacao { get; set; }

}