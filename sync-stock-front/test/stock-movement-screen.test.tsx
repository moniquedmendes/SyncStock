import React, { useContext } from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { jsonResponse } from "@/test/auth-helpers"

const SelectContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
} | null>(null)

vi.mock("@/components/ui/select", () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string
    onValueChange: (value: string) => void
    children: React.ReactNode
  }) => (
    <SelectContext.Provider value={{ value, onValueChange }}>
      <div>{children}</div>
    </SelectContext.Provider>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span>{placeholder}</span>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({
    value,
    children,
  }: {
    value: string
    children: React.ReactNode
  }) => {
    const context = useContext(SelectContext)

    return (
      <button
        type="button"
        data-selected={context?.value === value}
        onClick={() => context?.onValueChange(value)}
      >
        {children}
      </button>
    )
  },
}))

import { StockMovementScreen } from "@/components/screens/stock-movement-screen"

const productsPayload = [
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
]

describe("StockMovementScreen", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("loads products from the api", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(productsPayload)),
    )

    render(<StockMovementScreen />)

    await waitFor(() =>
      expect(
        screen.getByRole("button", {
          name: "PF-001 - Pastilha de Freio Dianteira (Estoque: 18)",
        }),
      ).toBeInTheDocument(),
    )
  })

  it("blocks non-positive quantities before calling the movement api", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse(productsPayload))
    vi.stubGlobal("fetch", fetchMock)

    render(<StockMovementScreen />)

    await screen.findByRole("button", {
      name: "PF-001 - Pastilha de Freio Dianteira (Estoque: 18)",
    })
    fireEvent.click(
      screen.getByRole("button", {
        name: "PF-001 - Pastilha de Freio Dianteira (Estoque: 18)",
      }),
    )
    fireEvent.change(screen.getByLabelText("Quantidade"), {
      target: { value: "0" },
    })

    fireEvent.click(screen.getByRole("button", { name: "Confirmar Entrada" }))

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Quantidade deve ser maior que zero.",
      ),
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("submits an entry movement and refreshes products", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(productsPayload))
      .mockResolvedValueOnce(
        jsonResponse(
          {
            id: 10,
            productId: 1,
            productName: "Pastilha de Freio Dianteira",
            type: "Entrada",
            quantity: 5,
            date: "2026-04-29T00:00:00",
            observation: "Compra",
            resultingStock: 23,
          },
          { status: 201 },
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse([
          {
            ...productsPayload[0],
            quantidadeEstoque: 23,
          },
        ]),
      )
    vi.stubGlobal("fetch", fetchMock)

    render(<StockMovementScreen />)

    fireEvent.click(
      await screen.findByRole("button", {
        name: "PF-001 - Pastilha de Freio Dianteira (Estoque: 18)",
      }),
    )
    fireEvent.change(screen.getByLabelText("Quantidade"), {
      target: { value: "5" },
    })
    fireEvent.change(screen.getByLabelText("Observacao"), {
      target: { value: "Compra" },
    })

    fireEvent.click(screen.getByRole("button", { name: "Confirmar Entrada" }))

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Entrada registrada. Estoque atual: 23.",
      ),
    )
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/stock-movements",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: expect.stringContaining('"quantity":5'),
      }),
    )
  })

  it("shows the backend insufficient stock error", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(productsPayload))
      .mockResolvedValueOnce(
        jsonResponse(
          {
            title: "Insufficient stock",
            detail: "Estoque insuficiente para realizar a saida.",
          },
          { status: 400 },
        ),
      )
    vi.stubGlobal("fetch", fetchMock)

    render(<StockMovementScreen />)

    fireEvent.click(
      await screen.findByRole("button", {
        name: "PF-001 - Pastilha de Freio Dianteira (Estoque: 18)",
      }),
    )
    fireEvent.click(screen.getByRole("button", { name: "Saida" }))
    fireEvent.change(screen.getByLabelText("Quantidade"), {
      target: { value: "20" },
    })

    fireEvent.click(screen.getByRole("button", { name: "Confirmar Saida" }))

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Estoque insuficiente para realizar a saida.",
      ),
    )
  })
})
