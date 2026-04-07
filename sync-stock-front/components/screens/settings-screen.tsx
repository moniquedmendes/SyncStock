"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

export function SettingsScreen() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Configuracoes</h2>
        <p className="text-sm text-muted-foreground">
          Configuracoes gerais do sistema
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Company Info */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-card-foreground">
              Dados da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-foreground">
                Nome da Empresa
              </Label>
              <Input
                defaultValue="Sync Stock Brasil LTDA"
                className="h-10 border-border bg-secondary text-foreground focus-visible:ring-primary"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-foreground">CNPJ</Label>
              <Input
                defaultValue="12.345.678/0001-90"
                className="h-10 border-border bg-secondary text-foreground focus-visible:ring-primary"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-foreground">Endereco</Label>
              <Input
                defaultValue="Rua das Industrias, 1500 - SP"
                className="h-10 border-border bg-secondary text-foreground focus-visible:ring-primary"
              />
            </div>
            <Button className="mt-2 w-fit bg-primary text-primary-foreground hover:bg-primary/90">
              Salvar Alteracoes
            </Button>
          </CardContent>
        </Card>

        {/* System Preferences */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-card-foreground">
              Preferencias do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">
                  Notificacoes de estoque baixo
                </p>
                <p className="text-xs text-muted-foreground">
                  Receber alertas quando produtos atingirem estoque minimo
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">
                  Relatorios automaticos
                </p>
                <p className="text-xs text-muted-foreground">
                  Gerar relatorios semanais automaticamente
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">
                  Backup automatico
                </p>
                <p className="text-xs text-muted-foreground">
                  Realizar backup diario dos dados do sistema
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">
                  Modo de auditoria
                </p>
                <p className="text-xs text-muted-foreground">
                  Registrar todas as acoes dos usuarios no log
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
