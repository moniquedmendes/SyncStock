import { render, screen, waitFor } from "@testing-library/react"
import { ReportsScreen } from "@/components/screens/reports-screen"
import { jsonResponse } from "@/test/auth-helpers"

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Pie: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Cell: () => <div />,
}))

describe("ReportsScreen", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("loads report summary and charts from real dashboard data", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({
        totalProducts: 2,
        lowStockProducts: 1,
        monthlyMovementCount: 3,
        activeSuppliers: 2,
        totalStockItems: 14,
        totalStockValue: 240,
        averageMovementsPerDay: 1,
        recentMovements: [],
        monthlyMovements: [{ month: "abr/2026", entries: 7, exits: 3 }],
        categoryStock: [{ category: "Freios API", quantity: 4 }],
      }),
    )
    vi.stubGlobal("fetch", fetchMock)

    render(<ReportsScreen />)

    expect(screen.getByText("Carregando relatorios...")).toBeInTheDocument()

    await waitFor(() => expect(screen.getByText("R$ 240,00")).toBeInTheDocument())
    expect(screen.getByText("14")).toBeInTheDocument()
    expect(screen.getByText("Freios API")).toBeInTheDocument()

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/dashboard/summary",
      expect.objectContaining({
        credentials: "include",
      }),
    )
  })
})
