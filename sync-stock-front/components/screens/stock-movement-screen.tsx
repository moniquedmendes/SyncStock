"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { fetchProducts, type Product } from "@/lib/products-api"
import {
  createStockMovement,
  type StockMovementType,
} from "@/lib/stock-movements-api"
import { cn } from "@/lib/utils"

function todayAsInputValue() {
  return new Date().toISOString().slice(0, 10)
}

export function StockMovementScreen() {
  const [movementType, setMovementType] = useState<StockMovementType>("Entrada")
  const [products, setProducts] = useState<Product[]>([])
  const [product, setProduct] = useState("")
  const [quantity, setQuantity] = useState("")
  const [date, setDate] = useState(todayAsInputValue)
  const [observation, setObservation] = useState("")
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [reloadVersion, setReloadVersion] = useState(0)

  useEffect(() => {
    let active = true

    async function loadProducts() {
      try {
        setIsLoadingProducts(true)
        setErrorMessage(null)
        const data = await fetchProducts()
        if (active) {
          setProducts(data)
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Nao foi possivel carregar os produtos.",
          )
        }
      } finally {
        if (active) {
          setIsLoadingProducts(false)
        }
      }
    }

    void loadProducts()

    return () => {
      active = false
    }
  }, [reloadVersion])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const parsedQuantity = Number(quantity)
    if (!product) {
      setErrorMessage("Selecione um produto antes de registrar a movimentacao.")
      setSuccessMessage(null)
      return
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setErrorMessage("Quantidade deve ser maior que zero.")
      setSuccessMessage(null)
      return
    }

    if (!date) {
      setErrorMessage("Informe a data da movimentacao.")
      setSuccessMessage(null)
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const movement = await createStockMovement({
        productId: Number(product),
        type: movementType,
        quantity: parsedQuantity,
        date,
        observation,
      })

      setQuantity("")
      setObservation("")
      setSuccessMessage(
        `${movementType} registrada. Estoque atual: ${movement.resultingStock}.`,
      )
      setReloadVersion((current) => current + 1)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel registrar a movimentacao.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">
          Movimentacao de Estoque
        </h2>
        <p className="text-sm text-muted-foreground">
          Registre entradas e saidas de produtos no estoque
        </p>
      </div>

      <div className="mx-auto w-full max-w-2xl">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-card-foreground">
              Nova Movimentacao
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {errorMessage ? (
              <div
                role="alert"
                className="rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div
                role="status"
                className="rounded border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary-foreground"
              >
                {successMessage}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Product */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-foreground">Produto</Label>
              <Select value={product} onValueChange={setProduct}>
                <SelectTrigger className="h-10 w-full border-border bg-secondary text-foreground">
                  <SelectValue
                    placeholder={
                      isLoadingProducts
                        ? "Carregando produtos..."
                        : "Selecione o produto"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="border-border bg-card">
                  {products.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.codigo} - {item.nome} (Estoque:{" "}
                      {item.quantidadeEstoque})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Movement Type Toggle */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-foreground">
                Tipo de Movimentacao
              </Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMovementType("Entrada")}
                  className={cn(
                    "flex-1 rounded border px-4 py-2.5 text-sm font-medium transition-colors",
                    movementType === "Entrada"
                      ? "border-primary bg-primary/10 text-chart-2"
                      : "border-border bg-secondary text-muted-foreground hover:bg-secondary/80"
                  )}
                >
                  Entrada
                </button>
                <button
                  type="button"
                  onClick={() => setMovementType("Saida")}
                  className={cn(
                    "flex-1 rounded border px-4 py-2.5 text-sm font-medium transition-colors",
                    movementType === "Saida"
                      ? "border-destructive bg-destructive/10 text-destructive-foreground"
                      : "border-border bg-secondary text-muted-foreground hover:bg-secondary/80"
                  )}
                >
                  Saida
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="quantity" className="text-sm text-foreground">
                Quantidade
              </Label>
              <Input
                id="quantity"
                type="number"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="h-10 border-border bg-secondary text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              />
            </div>

            {/* Date */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="date" className="text-sm text-foreground">
                Data
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 border-border bg-secondary text-foreground focus-visible:ring-primary [color-scheme:dark]"
              />
            </div>

            {/* Observation */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="observation" className="text-sm text-foreground">
                Observacao
              </Label>
              <Textarea
                id="observation"
                placeholder="Informacoes adicionais sobre a movimentacao..."
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                className="min-h-24 resize-none border-border bg-secondary text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting || isLoadingProducts}
              className={cn(
                "mt-2 h-10 w-full text-sm font-medium",
                movementType === "Entrada"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-destructive text-primary-foreground hover:bg-destructive/90"
              )}
            >
              {isSubmitting ? "Registrando..." : `Confirmar ${movementType}`}
            </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
