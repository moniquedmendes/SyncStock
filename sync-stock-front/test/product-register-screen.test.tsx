import React, { useContext } from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { jsonResponse } from "@/test/auth-helpers"

const navigateMock = vi.fn()
const SelectContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
} | null>(null)

vi.mock("@/lib/navigation-context", () => ({
  useNavigation: () => ({
    navigate: navigateMock,
  }),
}))

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

import { ProductRegisterScreen } from "@/components/screens/product-register-screen"

describe("ProductRegisterScreen", () => {
  beforeEach(() => {
    navigateMock.mockReset()
    vi.restoreAllMocks()
  })

  it("shows a validation message before sending incomplete data", async () => {
    const fetchMock = vi.fn<typeof fetch>()
    vi.stubGlobal("fetch", fetchMock)

    render(<ProductRegisterScreen />)

    fireEvent.click(screen.getByRole("button", { name: "Salvar Produto" }))

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Preencha todos os campos antes de salvar o produto.",
      ),
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("submits the product to the api and navigates back to the products page", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse(
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
        { status: 201 },
      ),
    )
    vi.stubGlobal("fetch", fetchMock)

    render(<ProductRegisterScreen />)

    fireEvent.change(screen.getByLabelText("Codigo"), {
      target: { value: "PF-001" },
    })
    fireEvent.change(screen.getByLabelText("Nome da Peca"), {
      target: { value: "Pastilha de Freio Dianteira" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Freios" }))
    fireEvent.click(screen.getByRole("button", { name: "Bosch" }))
    fireEvent.click(screen.getByRole("button", { name: "Distribuidora Nacional" }))
    fireEvent.change(screen.getByLabelText("Preco (R$)"), {
      target: { value: "89.9" },
    })
    fireEvent.change(screen.getByLabelText("Quantidade em Estoque"), {
      target: { value: "18" },
    })
    fireEvent.change(screen.getByLabelText("Estoque Minimo"), {
      target: { value: "10" },
    })

    fireEvent.click(screen.getByRole("button", { name: "Salvar Produto" }))

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith("products"))
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/products",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      }),
    )
  })
})
