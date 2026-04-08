"use client"

import { useEffect, useMemo, useState } from "react"
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
import { fetchProducts, type Product } from "@/lib/products-api"

export function ProductsScreen() {
  const { navigate } = useNavigation()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [reloadVersion, setReloadVersion] = useState(0)
  const [nameFilter, setNameFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [supplierFilter, setSupplierFilter] = useState("all")

  useEffect(() => {
    let active = true

    async function loadProducts() {
      try {
        setIsLoading(true)
        setErrorMessage(null)
        const data = await fetchProducts()
        if (!active) {
          return
        }

        setProducts(data)
      } catch (error) {
        if (!active) {
          return
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Nao foi possivel carregar os produtos.",
        )
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void loadProducts()

    return () => {
      active = false
    }
  }, [reloadVersion])

  const categoryOptions = useMemo(
    () => Array.from(new Set(products.map((product) => product.categoria))),
    [products],
  )
  const supplierOptions = useMemo(
    () => Array.from(new Set(products.map((product) => product.fornecedor))),
    [products],
  )
  const filtered = useMemo(
    () =>
      products.filter((product) => {
        const matchName =
          !nameFilter ||
          product.nome.toLowerCase().includes(nameFilter.toLowerCase())
        const matchCategory =
          categoryFilter === "all" || product.categoria === categoryFilter
        const matchSupplier =
          supplierFilter === "all" || product.fornecedor === supplierFilter

        return matchName && matchCategory && matchSupplier
      }),
    [products, nameFilter, categoryFilter, supplierFilter],
  )

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
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
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
                  {supplierOptions.map((supplier) => (
                    <SelectItem key={supplier} value={supplier}>
                      {supplier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              size="sm"
              type="button"
              className="h-9 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setReloadVersion((current) => current + 1)}
            >
              <Search className="mr-1.5 h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {errorMessage ? (
        <div
          role="alert"
          className="rounded border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <Card className="border-border bg-card">
          <CardContent className="px-6 py-10 text-sm text-muted-foreground">
            Carregando produtos...
          </CardContent>
        </Card>
      ) : null}

      {/* Products Table */}
      <Card className="border-border bg-card" aria-busy={isLoading}>
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
              {!isLoading && filtered.length === 0 ? (
                <TableRow className="border-border">
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    Nenhum produto encontrado com os filtros atuais.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((product, i) => (
                  <TableRow
                    key={product.id}
                    className={`border-border cursor-pointer transition-colors hover:bg-secondary/50 ${i % 2 === 0 ? "bg-card" : "bg-secondary/20"}`}
                  >
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {product.codigo}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-card-foreground">
                      {product.nome}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {product.categoria}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {product.fornecedor}
                    </TableCell>
                    <TableCell className="text-right text-sm text-card-foreground">
                      {product.quantidadeEstoque}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {product.estoqueMinimo}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          product.statusEstoque === "Normal"
                            ? "border-none bg-secondary text-muted-foreground"
                            : "border-none bg-destructive/20 text-destructive-foreground"
                        }
                      >
                        {product.statusEstoque}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
