"use client"

import { useState } from "react"
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
import { cn } from "@/lib/utils"

const productsList = [
  "PF-001 - Pastilha de Freio Dianteira",
  "FO-002 - Filtro de Oleo Motor",
  "AT-003 - Amortecedor Traseiro",
  "CD-004 - Correia Dentada",
  "VI-005 - Vela de Ignicao",
  "DT-006 - Disco de Freio Traseiro",
  "BV-007 - Bomba de Agua",
  "JH-008 - Junta do Cabecote",
  "RL-009 - Rolamento de Roda",
  "AL-010 - Alternador",
]

export function StockMovementScreen() {
  const [movementType, setMovementType] = useState<"entry" | "exit">("entry")
  const [product, setProduct] = useState("")
  const [quantity, setQuantity] = useState("")
  const [date, setDate] = useState("")
  const [observation, setObservation] = useState("")

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
            {/* Product */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-foreground">Produto</Label>
              <Select value={product} onValueChange={setProduct}>
                <SelectTrigger className="h-10 w-full border-border bg-secondary text-foreground">
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent className="border-border bg-card">
                  {productsList.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
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
                  onClick={() => setMovementType("entry")}
                  className={cn(
                    "flex-1 rounded border px-4 py-2.5 text-sm font-medium transition-colors",
                    movementType === "entry"
                      ? "border-primary bg-primary/10 text-chart-2"
                      : "border-border bg-secondary text-muted-foreground hover:bg-secondary/80"
                  )}
                >
                  Entrada
                </button>
                <button
                  onClick={() => setMovementType("exit")}
                  className={cn(
                    "flex-1 rounded border px-4 py-2.5 text-sm font-medium transition-colors",
                    movementType === "exit"
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
              className={cn(
                "mt-2 h-10 w-full text-sm font-medium",
                movementType === "entry"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-destructive text-primary-foreground hover:bg-destructive/90"
              )}
            >
              Confirmar {movementType === "entry" ? "Entrada" : "Saida"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
