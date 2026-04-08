using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SyncStock.Contracts.Products;
using SyncStock.Services.Products;

namespace SyncStock.Controllers.Api;

[ApiController]
[Authorize]
[Route("api/products")]
public sealed class ProductsApiController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsApiController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProductResponse>>> GetProducts(CancellationToken cancellationToken)
    {
        var products = await _productService.GetActiveProductsAsync(cancellationToken);
        return Ok(products);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductResponse>> GetProductById(int id, CancellationToken cancellationToken)
    {
        var product = await _productService.GetActiveProductByIdAsync(id, cancellationToken);
        if (product is null)
        {
            return NotFound();
        }

        return Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<ProductResponse>> CreateProduct(
        [FromBody] CreateProductRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _productService.CreateProductAsync(request, cancellationToken);
        if (result.IsDuplicateCodigo)
        {
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Duplicate product code",
                Detail = "Ja existe um produto cadastrado com esse codigo."
            });
        }

        return Created($"/api/products/{result.Product!.Id}", result.Product);
    }
}
