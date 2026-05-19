import { render, screen, waitFor } from "@testing-library/react"
import { DashboardScreen } from "@/components/screens/dashboard-screen"
import { jsonResponse } from "@/test/auth-helpers"

const navigateMock = vi.fn()

vi.mock("@/lib/navigation-context", () => ({
  useNavigation: () => ({
    navigate: navigateMock,
  }),
}))

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => <div />,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
}))

describe("DashboardScreen", () => {
  beforeEach(() => {
    navigateMock.mockReset()
    vi.restoreAllMocks()
  })

  it("loads dashboard indicators and recent movements from the api", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({
        totalProducts: 2,
        lowStockProducts: 1,
        monthlyMovementCount: 3,
        activeSuppliers: 2,
        totalStockItems: 14,
        totalStockValue: 240,
        averageMovementsPerDay: 1,
        recentMovements: [
          {
            id: 99,
            productId: 1,
            productCode: "PR-API",
            productName: "Produto API Real",
            type: "Entrada",
            quantity: 7,
            date: "2026-04-10T10:00:00",
            observation: "Reposicao",
          },
        ],
        monthlyMovements: [{ month: "abr/2026", entries: 7, exits: 3 }],
        categoryStock: [{ category: "Freios API", quantity: 4 }],
      }),
    )
    vi.stubGlobal("fetch", fetchMock)

    render(<DashboardScreen />)

    expect(screen.getByText("Carregando dashboard...")).toBeInTheDocument()

    await waitFor(() =>
      expect(screen.getByText("Produto API Real")).toBeInTheDocument(),
    )
    expect(screen.getByText("PR-API")).toBeInTheDocument()
    expect(screen.getByText("Freios API")).toBeInTheDocument()

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/dashboard/summary",
      expect.objectContaining({
        credentials: "include",
      }),
    )
  })

  it("shows an inline error when the dashboard api fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        jsonResponse(
          {
            title: "Server error",
            detail: "Nao foi possivel carregar o dashboard.",
          },
          { status: 500 },
        ),
      ),
    )

    render(<DashboardScreen />)

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Nao foi possivel carregar o dashboard.",
      ),
    )
  })
})
