"use client"

import {
  Package,
  AlertTriangle,
  ArrowLeftRight,
  Truck,
  Plus,
  ClipboardList,
  BarChart3,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useNavigation } from "@/lib/navigation-context"

const stats = [
  {
    label: "Total de Produtos",
    value: "1.248",
    icon: Package,
    change: "+12 este mes",
  },
  {
    label: "Estoque Baixo",
    value: "23",
    icon: AlertTriangle,
    change: "Requer atencao",
    alert: true,
  },
  {
    label: "Movimentacoes Mensais",
    value: "342",
    icon: ArrowLeftRight,
    change: "+8% vs. mes anterior",
  },
  {
    label: "Fornecedores Ativos",
    value: "47",
    icon: Truck,
    change: "3 novos este mes",
  },
]

const movementData = [
  { mes: "Jan", entradas: 120, saidas: 90 },
  { mes: "Fev", entradas: 140, saidas: 110 },
  { mes: "Mar", entradas: 100, saidas: 130 },
  { mes: "Abr", entradas: 170, saidas: 120 },
  { mes: "Mai", entradas: 160, saidas: 140 },
  { mes: "Jun", entradas: 180, saidas: 150 },
]

const categoryData = [
  { categoria: "Motor", quantidade: 320 },
  { categoria: "Suspensao", quantidade: 240 },
  { categoria: "Eletrica", quantidade: 180 },
  { categoria: "Freios", quantidade: 290 },
  { categoria: "Transmissao", quantidade: 150 },
]

const recentMovements = [
  {
    id: "MOV-001",
    product: "Pastilha de Freio Dianteira",
    type: "Entrada",
    quantity: 50,
    date: "28/02/2026",
  },
  {
    id: "MOV-002",
    product: "Filtro de Oleo Motor",
    type: "Saida",
    quantity: 12,
    date: "28/02/2026",
  },
  {
    id: "MOV-003",
    product: "Amortecedor Traseiro",
    type: "Entrada",
    quantity: 30,
    date: "27/02/2026",
  },
  {
    id: "MOV-004",
    product: "Correia Dentada",
    type: "Saida",
    quantity: 8,
    date: "27/02/2026",
  },
  {
    id: "MOV-005",
    product: "Vela de Ignicao",
    type: "Entrada",
    quantity: 100,
    date: "26/02/2026",
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
            {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function DashboardScreen() {
  const { navigate } = useNavigation()

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
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

      {/* Stats Cards */}
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

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Line Chart - Stock Movement Trend */}
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

        {/* Bar Chart - Categories */}
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
          </CardContent>
        </Card>
      </div>

      {/* Recent Movements Table */}
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
              {recentMovements.map((mov, i) => (
                <TableRow
                  key={mov.id}
                  className={`border-border ${i % 2 === 0 ? "bg-card" : "bg-secondary/30"}`}
                >
                  <TableCell className="text-sm font-mono text-muted-foreground">
                    {mov.id}
                  </TableCell>
                  <TableCell className="text-sm text-card-foreground">
                    {mov.product}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        mov.type === "Entrada" ? "default" : "secondary"
                      }
                      className={
                        mov.type === "Entrada"
                          ? "bg-primary/20 text-chart-2 border-none"
                          : "bg-destructive/20 text-destructive-foreground border-none"
                      }
                    >
                      {mov.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-card-foreground">
                    {mov.quantity}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {mov.date}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
