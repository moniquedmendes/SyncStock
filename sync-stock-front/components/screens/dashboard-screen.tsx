"use client"

import { useEffect, useState } from "react"
import {
  AlertTriangle,
  ArrowLeftRight,
  BarChart3,
  ClipboardList,
  Package,
  Plus,
  Truck,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DashboardSummary,
  fetchDashboardSummary,
} from "@/lib/dashboard-api"
import { useNavigation } from "@/lib/navigation-context"

const numberFormatter = new Intl.NumberFormat("pt-BR")

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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value))
}

function formatMovementId(id: number) {
  return `MOV-${String(id).padStart(3, "0")}`
}

function buildStats(summary: DashboardSummary) {
  return [
    {
      label: "Total de Produtos",
      value: numberFormatter.format(summary.totalProducts),
      icon: Package,
      change: "Produtos ativos cadastrados",
    },
    {
      label: "Estoque Baixo",
      value: numberFormatter.format(summary.lowStockProducts),
      icon: AlertTriangle,
      change: "Requer atencao",
      alert: summary.lowStockProducts > 0,
    },
    {
      label: "Movimentacoes Mensais",
      value: numberFormatter.format(summary.monthlyMovementCount),
      icon: ArrowLeftRight,
      change: "No mes atual",
    },
    {
      label: "Fornecedores Ativos",
      value: numberFormatter.format(summary.activeSuppliers),
      icon: Truck,
      change: "Com produtos ativos",
    },
  ]
}

export function DashboardScreen() {
  const { navigate } = useNavigation()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
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
            : "Nao foi possivel carregar o dashboard.",
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  const stats = summary ? buildStats(summary) : []
  const movementData =
    summary?.monthlyMovements.map((movement) => ({
      mes: movement.month,
      entradas: movement.entries,
      saidas: movement.exits,
    })) ?? []
  const categoryData =
    summary?.categoryStock.map((category) => ({
      categoria: category.category,
      quantidade: category.quantity,
    })) ?? []

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Visao geral do sistema de inventario
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => navigate("product-register")}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Novo Produto
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-border text-foreground hover:bg-secondary"
            onClick={() => navigate("stock-movement")}
          >
            <ClipboardList className="mr-1.5 h-4 w-4" />
            Registrar Movimentacao
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-border text-foreground hover:bg-secondary"
            onClick={() => navigate("reports")}
          >
            <BarChart3 className="mr-1.5 h-4 w-4" />
            Ver Relatorios
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card className="border-border bg-card">
          <CardContent className="p-5 text-sm text-muted-foreground">
            Carregando dashboard...
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
          <div className="grid grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="border-border bg-card">
                <CardContent className="flex items-start justify-between p-5">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-card-foreground">
                      {stat.value}
                    </p>
                    <p
                      className={`text-xs ${stat.alert ? "text-destructive-foreground" : "text-muted-foreground"}`}
                    >
                      {stat.change}
                    </p>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded ${stat.alert ? "bg-destructive/20" : "bg-primary/10"}`}
                  >
                    <stat.icon
                      className={`h-5 w-5 ${stat.alert ? "text-destructive-foreground" : "text-chart-2"}`}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">
                  Tendencia de Movimentacao
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={movementData}>
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
                      <Line
                        type="monotone"
                        dataKey="entradas"
                        name="Entradas"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ fill: "#3B82F6", r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="saidas"
                        name="Saidas"
                        stroke="#60A5FA"
                        strokeWidth={2}
                        dot={{ fill: "#60A5FA", r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">
                  Produtos por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                      <XAxis
                        dataKey="categoria"
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
                        dataKey="quantidade"
                        name="Quantidade"
                        fill="#1E3A8A"
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex flex-wrap justify-center gap-4">
                  {categoryData.map((category) => (
                    <span
                      key={category.categoria}
                      className="text-xs text-muted-foreground"
                    >
                      {category.categoria}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Movimentacoes Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs text-muted-foreground">
                      Codigo
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground">
                      Produto
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground">
                      Tipo
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground">
                      Quantidade
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground">
                      Data
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.recentMovements.length === 0 ? (
                    <TableRow className="border-border">
                      <TableCell
                        colSpan={5}
                        className="text-sm text-muted-foreground"
                      >
                        Nenhuma movimentacao registrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    summary.recentMovements.map((movement, index) => (
                      <TableRow
                        key={movement.id}
                        className={`border-border ${index % 2 === 0 ? "bg-card" : "bg-secondary/30"}`}
                      >
                        <TableCell className="text-sm font-mono text-muted-foreground">
                          <div>{movement.productCode}</div>
                          <div className="text-[10px]">
                            {formatMovementId(movement.id)}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-card-foreground">
                          {movement.productName}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              movement.type === "Entrada"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              movement.type === "Entrada"
                                ? "bg-primary/20 text-chart-2 border-none"
                                : "bg-destructive/20 text-destructive-foreground border-none"
                            }
                          >
                            {movement.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-card-foreground">
                          {numberFormatter.format(movement.quantity)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(movement.date)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
