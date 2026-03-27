"use client"

import { useState } from "react"
import { Search, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
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
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useNavigation } from "@/lib/navigation-context"

const products = [
  {
    code: "PF-001",
    name: "Pastilha de Freio Dianteira",
    category: "Freios",
    supplier: "Distribuidora Nacional",
    currentQty: 150,
    minimumStock: 30,
    status: "Normal",
  },
  {
    code: "FO-002",
    name: "Filtro de Oleo Motor",
    category: "Motor",
    supplier: "Auto Pecas Brasil",
    currentQty: 12,
    minimumStock: 20,
    status: "Estoque Baixo",
  },
  {
    code: "AT-003",
    name: "Amortecedor Traseiro",
    category: "Suspensao",
    supplier: "Importadora Paulista",
    currentQty: 45,
    minimumStock: 15,
    status: "Normal",
  },
  {
    code: "CD-004",
    name: "Correia Dentada",
    category: "Motor",
    supplier: "Central Parts LTDA",
    currentQty: 8,
    minimumStock: 25,
    status: "Estoque Baixo",
  },
  {
    code: "VI-005",
    name: "Vela de Ignicao",
    category: "Eletrica",
    supplier: "Mega Distribuidora",
    currentQty: 200,
    minimumStock: 50,
    status: "Normal",
  },
  {
    code: "DT-006",
    name: "Disco de Freio Traseiro",
    category: "Freios",
    supplier: "Distribuidora Nacional",
    currentQty: 35,
    minimumStock: 10,
    status: "Normal",
  },
  {
    code: "BV-007",
    name: "Bomba de Agua",
    category: "Arrefecimento",
    supplier: "Auto Pecas Brasil",
    currentQty: 5,
    minimumStock: 15,
    status: "Estoque Baixo",
  },
  {
    code: "JH-008",
    name: "Junta do Cabecote",
    category: "Motor",
    supplier: "Central Parts LTDA",
    currentQty: 22,
    minimumStock: 10,
    status: "Normal",
  },
  {
    code: "RL-009",
    name: "Rolamento de Roda",
    category: "Suspensao",
    supplier: "Importadora Paulista",
    currentQty: 60,
    minimumStock: 20,
    status: "Normal",
  },
  {
    code: "AL-010",
    name: "Alternador",
    category: "Eletrica",
    supplier: "Mega Distribuidora",
    currentQty: 3,
    minimumStock: 8,
    status: "Estoque Baixo",
  },
]

export function ProductsScreen() {
  const { navigate } = useNavigation()
  const [nameFilter, setNameFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [supplierFilter, setSupplierFilter] = useState("all")

  const filtered = products.filter((p) => {
    const matchName =
      !nameFilter ||
      p.name.toLowerCase().includes(nameFilter.toLowerCase())
    const matchCategory =
      categoryFilter === "all" || p.category === categoryFilter
    const matchSupplier =
      supplierFilter === "all" || p.supplier === supplierFilter
    return matchName && matchCategory && matchSupplier
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Consulta de Produtos
          </h2>
          <p className="text-sm text-muted-foreground">
            Pesquise e visualize o catalogo de pecas
          </p>
        </div>
        <Button
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => navigate("product-register")}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-card-foreground">
            Filtros de Pesquisa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <label className="text-xs text-muted-foreground">Nome</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome..."
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  className="h-9 border-border bg-secondary pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
              </div>
            </div>
            <div className="flex w-48 flex-col gap-2">
              <label className="text-xs text-muted-foreground">Categoria</label>
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="h-9 border-border bg-secondary text-foreground">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent className="border-border bg-card">
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Motor">Motor</SelectItem>
                  <SelectItem value="Suspensao">Suspensao</SelectItem>
                  <SelectItem value="Eletrica">Eletrica</SelectItem>
                  <SelectItem value="Freios">Freios</SelectItem>
                  <SelectItem value="Arrefecimento">Arrefecimento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-56 flex-col gap-2">
              <label className="text-xs text-muted-foreground">
                Fornecedor
              </label>
              <Select
                value={supplierFilter}
                onValueChange={setSupplierFilter}
              >
                <SelectTrigger className="h-9 border-border bg-secondary text-foreground">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent className="border-border bg-card">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Distribuidora Nacional">
                    Distribuidora Nacional
                  </SelectItem>
                  <SelectItem value="Auto Pecas Brasil">
                    Auto Pecas Brasil
                  </SelectItem>
                  <SelectItem value="Importadora Paulista">
                    Importadora Paulista
                  </SelectItem>
                  <SelectItem value="Central Parts LTDA">
                    Central Parts LTDA
                  </SelectItem>
                  <SelectItem value="Mega Distribuidora">
                    Mega Distribuidora
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              size="sm"
              className="h-9 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Search className="mr-1.5 h-4 w-4" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs text-muted-foreground">
                  Codigo
                </TableHead>
                <TableHead className="text-xs text-muted-foreground">
                  Nome da Peca
                </TableHead>
                <TableHead className="text-xs text-muted-foreground">
                  Categoria
                </TableHead>
                <TableHead className="text-xs text-muted-foreground">
                  Fornecedor
                </TableHead>
                <TableHead className="text-xs text-muted-foreground text-right">
                  Qtd. Atual
                </TableHead>
                <TableHead className="text-xs text-muted-foreground text-right">
                  Estoque Min.
                </TableHead>
                <TableHead className="text-xs text-muted-foreground">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product, i) => (
                <TableRow
                  key={product.code}
                  className={`border-border cursor-pointer transition-colors hover:bg-secondary/50 ${i % 2 === 0 ? "bg-card" : "bg-secondary/20"}`}
                >
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {product.code}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-card-foreground">
                    {product.name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {product.category}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {product.supplier}
                  </TableCell>
                  <TableCell className="text-right text-sm text-card-foreground">
                    {product.currentQty}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {product.minimumStock}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        product.status === "Normal"
                          ? "border-none bg-secondary text-muted-foreground"
                          : "border-none bg-destructive/20 text-destructive-foreground"
                      }
                    >
                      {product.status}
                    </Badge>
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
