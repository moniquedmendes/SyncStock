using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SyncStock.Contracts.StockMovements;
using SyncStock.Services.StockMovements;

namespace SyncStock.Controllers.Api;

[ApiController]
[Authorize]
[Route("api/stock-movements")]
public sealed class StockMovementsApiController : ControllerBase
{
    private readonly IStockMovementService _stockMovementService;

    public StockMovementsApiController(IStockMovementService stockMovementService)
    {
        _stockMovementService = stockMovementService;
    }

    [HttpGet]
    public async Task<ActionResult<StockMovementListResponse>> ListMovements(
        [FromQuery] int? productId,
        [FromQuery] string? type,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var query = new StockMovementQuery(productId, type, from, to, page, pageSize);
        return Ok(await _stockMovementService.ListMovementsAsync(query, cancellationToken));
    }

    [HttpPost]
    public async Task<ActionResult<StockMovementResponse>> CreateMovement(
        [FromBody] CreateStockMovementRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _stockMovementService.CreateMovementAsync(request, cancellationToken);

        return result.Error switch
        {
            StockMovementError.None => Created(
                $"/api/stock-movements/{result.Movement!.Id}",
                result.Movement),
            StockMovementError.ProductNotFound => NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Product not found",
                Detail = "Produto nao encontrado ou inativo."
            }),
            StockMovementError.InvalidType => BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid movement type",
                Detail = "Tipo de movimentacao deve ser Entrada ou Saida."
            }),
            StockMovementError.InvalidQuantity => BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid quantity",
                Detail = "Quantidade deve ser maior que zero."
            }),
            StockMovementError.InsufficientStock => BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Insufficient stock",
                Detail = "Estoque insuficiente para realizar a saida."
            }),
            _ => StatusCode(StatusCodes.Status500InternalServerError)
        };
    }
}
