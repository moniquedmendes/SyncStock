"use client"

import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Cog,
} from "lucide-react"
import { useNavigation, type Page } from "@/lib/navigation-context"
import { cn } from "@/lib/utils"

const navItems: { label: string; icon: React.ElementType; page: Page }[] = [
  { label: "Dashboard", icon: LayoutDashboard, page: "dashboard" },
  { label: "Produtos", icon: Package, page: "products" },
  { label: "Movimentacao", icon: ArrowLeftRight, page: "stock-movement" },
  { label: "Relatorios", icon: BarChart3, page: "reports" },
  { label: "Usuarios", icon: Users, page: "users" },
  { label: "Configuracoes", icon: Settings, page: "settings" },
]

export function AppSidebar() {
  const { currentPage, navigate, logout } = useNavigation()

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
          <Cog className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-sidebar-foreground">
            Sync Stock
          </h1>
          <p className="text-[10px] text-muted-foreground">Sistema de Gestao de Estoque</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.page
            return (
              <li key={item.page}>
                <button
                  onClick={() => navigate(item.page)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-primary"
                      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-3 py-3">
        <button
          onClick={() => void logout()}
          className="flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-destructive-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
