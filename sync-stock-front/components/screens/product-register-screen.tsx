"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useNavigation } from "@/lib/navigation-context"

const categories = [
  "Motor",
  "Suspensao",
  "Eletrica",
  "Freios",
  "Transmissao",
  "Carroceria",
  "Arrefecimento",
  "Direcao",
]

const brands = [
  "Bosch",
  "Cofap",
  "Monroe",
  "Valeo",
  "NGK",
  "Mahle",
  "ZF",
  "Continental",
]

const suppliers = [
  "Distribuidora Nacional",
  "Auto Pecas Brasil",
  "Importadora Paulista",
  "Central Parts LTDA",
  "Mega Distribuidora",
]

export function ProductRegisterScreen() {
  const { navigate } = useNavigation()
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "",
    brand: "",
    supplier: "",
    price: "",
    stockQuantity: "",
    minimumStock: "",
  })

  function handleChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("products")}
          className="flex h-8 w-8 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Cadastro de Produto
          </h2>
          <p className="text-sm text-muted-foreground">
            Preencha os dados para cadastrar um novo produto
          </p>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-card-foreground">
            Informacoes do Produto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            {/* Code */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="code" className="text-sm text-foreground">
                Codigo
              </Label>
              <Input
                id="code"
                placeholder="Ex: PF-001"
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                className="h-10 border-border bg-secondary text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              />
            </div>

            {/* Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-sm text-foreground">
                Nome da Peca
              </Label>
              <Input
                id="name"
                placeholder="Ex: Pastilha de Freio Dianteira"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="h-10 border-border bg-secondary text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-foreground">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => handleChange("category", v)}
              >
                <SelectTrigger className="h-10 w-full border-border bg-secondary text-foreground">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent className="border-border bg-card">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Brand */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-foreground">Marca</Label>
              <Select
                value={formData.brand}
                onValueChange={(v) => handleChange("brand", v)}
              >
                <SelectTrigger className="h-10 w-full border-border bg-secondary text-foreground">
                  <SelectValue placeholder="Selecione a marca" />
                </SelectTrigger>
                <SelectContent className="border-border bg-card">
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Supplier */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-foreground">Fornecedor</Label>
              <Select
                value={formData.supplier}
                onValueChange={(v) => handleChange("supplier", v)}
              >
                <SelectTrigger className="h-10 w-full border-border bg-secondary text-foreground">
                  <SelectValue placeholder="Selecione o fornecedor" />
                </SelectTrigger>
                <SelectContent className="border-border bg-card">
                  {suppliers.map((sup) => (
                    <SelectItem key={sup} value={sup}>
                      {sup}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="price" className="text-sm text-foreground">
                Preco (R$)
              </Label>
              <Input
                id="price"
                type="number"
                placeholder="0,00"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                className="h-10 border-border bg-secondary text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              />
            </div>

            {/* Stock Quantity */}
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="stockQuantity"
                className="text-sm text-foreground"
              >
                Quantidade em Estoque
              </Label>
              <Input
                id="stockQuantity"
                type="number"
                placeholder="0"
                value={formData.stockQuantity}
                onChange={(e) => handleChange("stockQuantity", e.target.value)}
                className="h-10 border-border bg-secondary text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              />
            </div>

            {/* Minimum Stock */}
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="minimumStock"
                className="text-sm text-foreground"
              >
                Estoque Minimo
              </Label>
              <Input
                id="minimumStock"
                type="number"
                placeholder="0"
                value={formData.minimumStock}
                onChange={(e) => handleChange("minimumStock", e.target.value)}
                className="h-10 border-border bg-secondary text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end gap-3">
            <Button
              variant="outline"
              className="border-destructive/50 text-destructive-foreground hover:bg-destructive/10"
            >
              Excluir
            </Button>
            <Button
              variant="outline"
              className="border-border text-foreground hover:bg-secondary"
            >
              Editar
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Salvar Produto
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
