"use client"

import { Bell, Search, User } from "lucide-react"
import { Input } from "@/components/ui/input"

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-accent px-6">
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar produtos, fornecedores..."
          className="h-9 border-secondary bg-secondary pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        <button className="relative rounded p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-chart-2" />
          <span className="sr-only">Notificacoes</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-foreground">Administrador</p>
            <p className="text-xs text-muted-foreground">admin@syncstock.com</p>
          </div>
        </div>
      </div>
    </header>
  )
}
