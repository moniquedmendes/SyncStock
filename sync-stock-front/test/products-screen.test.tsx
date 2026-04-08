import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { ProductsScreen } from "@/components/screens/products-screen"
import { jsonResponse } from "@/test/auth-helpers"

const navigateMock = vi.fn()

vi.mock("@/lib/navigation-context", () => ({
  useNavigation: () => ({
    navigate: navigateMock,
  }),
}))

describe("ProductsScreen", () => {
  beforeEach(() => {
    navigateMock.mockReset()
    vi.restoreAllMocks()
  })

  it("loads products from the api and filters by product name", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse([
        {
          id: 1,
          codigo: "PF-001",
          nome: "Pastilha de Freio Dianteira",
          categoria: "Freios",
          marca: "Bosch",
          fornecedor: "Distribuidora Nacional",
          preco: 89.9,
          quantidadeEstoque: 18,
          estoqueMinimo: 10,
          statusEstoque: "Normal",
        },
        {
          id: 2,
          codigo: "FO-002",
          nome: "Filtro de Oleo Motor",
          categoria: "Motor",
          marca: "Mahle",
          fornecedor: "Auto Pecas Brasil",
          preco: 19.5,
          quantidadeEstoque: 4,
          estoqueMinimo: 10,
          statusEstoque: "Estoque Baixo",
        },
      ]),
    )

    vi.stubGlobal("fetch", fetchMock)

    render(<ProductsScreen />)

    expect(screen.getByText("Carregando produtos...")).toBeInTheDocument()

    await waitFor(() =>
      expect(screen.getByText("Pastilha de Freio Dianteira")).toBeInTheDocument(),
    )
    expect(screen.getByText("Filtro de Oleo Motor")).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText("Buscar por nome..."), {
      target: { value: "Filtro" },
    })

    expect(screen.queryByText("Pastilha de Freio Dianteira")).not.toBeInTheDocument()
    expect(screen.getByText("Filtro de Oleo Motor")).toBeInTheDocument()

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/products",
      expect.objectContaining({
        credentials: "include",
      }),
    )
  })

  it("shows an inline error when the products api fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        jsonResponse(
          {
            title: "Server error",
            detail: "Nao foi possivel carregar os produtos.",
          },
          { status: 500 },
        ),
      ),
    )

    render(<ProductsScreen />)

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Nao foi possivel carregar os produtos.",
      ),
    )
  })
})
