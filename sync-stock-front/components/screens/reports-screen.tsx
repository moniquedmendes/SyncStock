"use client"

import { useEffect, useState } from "react"
import {
  AlertTriangle,
  ArrowLeftRight,
  Download,
  Package,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DashboardSummary,
  fetchDashboardSummary,
} from "@/lib/dashboard-api"

const PIE_COLORS = ["#1E3A8A", "#3B82F6", "#60A5FA", "#93C5FD", "#DBEAFE"]

const numberFormatter = new Intl.NumberFormat("pt-BR")
const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

const reportCards = [
  {
    title: "Estoque Atual",
    description: "Relatorio completo do estoque com quantidades e valores",
    icon: Package,
  },
  {
    title: "Movimentacoes por Periodo",
    description: "Entradas e saidas de produtos por periodo selecionado",
    icon: ArrowLeftRight,
  },
  {
    title: "Produtos com Estoque Baixo",
    description: "Listagem de produtos abaixo do estoque minimo definido",
    icon: AlertTriangle,
  },
]

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: string
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded border border-border bg-card px-3 py-2 shadow-lg">
        <p className="mb-1 text-xs font-medium text-foreground">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs text-muted-foreground">
            <span style={{ color: entry.color }}>{entry.name}</span>:{" "}
            {numberFormatter.format(entry.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

function buildSummaryStats(summary: DashboardSummary) {
  return [
    {
      label: "Total de Itens em Estoque",
      value: numberFormatter.format(summary.totalStockItems),
    },
    {
      label: "Valor Total do Estoque",
      value: currencyFormatter.format(summary.totalStockValue),
    },
    {
      label: "Produtos com Estoque Baixo",
      value: numberFormatter.format(summary.lowStockProducts),
    },
    {
      label: "Media de Movimentacoes/Dia",
      value: numberFormatter.format(summary.averageMovementsPerDay),
    },
  ]
}

export function ReportsScreen() {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadReports() {
      try {
        const data = await fetchDashboardSummary()
        if (!isMounted) {
          return
        }

        setSummary(data)
        setError(null)
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Nao foi possivel carregar os relatorios.",
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadReports()

    return () => {
      isMounted = false
    }
  }, [])

  const stockByCategory =
    summary?.categoryStock.map((category) => ({
      name: category.category,
      value: category.quantity,
    })) ?? []
  const monthlyMovements =
    summary?.monthlyMovements.map((movement) => ({
      mes: movement.month,
      entradas: movement.entries,
      saidas: movement.exits,
    })) ?? []
  const summaryStats = summary ? buildSummaryStats(summary) : []

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Relatorios</h2>
          <p className="text-sm text-muted-foreground">
            Visualize e exporte relatorios do sistema
          </p>
        </div>
        <Button
          variant="outline"
          className="border-border text-foreground hover:bg-secondary"
        >
          <Download className="mr-1.5 h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="flex items-end gap-4 p-4">
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">
              Data Inicial
            </Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9 w-44 border-border bg-secondary text-foreground focus-visible:ring-primary [color-scheme:dark]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">Data Final</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-9 w-44 border-border bg-secondary text-foreground focus-visible:ring-primary [color-scheme:dark]"
            />
          </div>
          <Button
            size="sm"
            className="h-9 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Gerar Relatorio
          </Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card className="border-border bg-card">
          <CardContent className="p-5 text-sm text-muted-foreground">
            Carregando relatorios...
          </CardContent>
        </Card>
      ) : error ? (
        <div
          role="alert"
          className="rounded border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground"
        >
          {error}
        </div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-3 gap-4">
            {reportCards.map((card) => (
              <Card
                key={card.title}
                className="border-border bg-card cursor-pointer transition-colors hover:border-primary/30"
              >
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary/10">
                    <card.icon className="h-5 w-5 text-chart-2" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-card-foreground">
                      {card.title}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-4">
            {summaryStats.map((stat) => (
              <Card key={stat.label} className="border-border bg-card">
                <CardContent className="flex flex-col gap-1 p-4">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold text-card-foreground">
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">
                  Movimentacoes por Periodo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyMovements}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                      <XAxis
                        dataKey="mes"
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="entradas"
                        name="Entradas"
                        fill="#1E3A8A"
                        radius={[2, 2, 0, 0]}
                      />
                      <Bar
                        dataKey="saidas"
                        name="Saidas"
                        fill="#60A5FA"
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">
                  Distribuicao por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stockByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {stockByCategory.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded border border-border bg-card px-3 py-2 shadow-lg">
                                <p className="text-xs font-medium text-foreground">
                                  {payload[0].name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {payload[0].value} itens
                                </p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex flex-wrap justify-center gap-4">
                  {stockByCategory.map((category, index) => (
                    <div key={category.name} className="flex items-center gap-1.5">
                      <div
                        className="h-2.5 w-2.5 rounded-sm"
                        style={{
                          backgroundColor:
                            PIE_COLORS[index % PIE_COLORS.length],
                        }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {category.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  )
}
