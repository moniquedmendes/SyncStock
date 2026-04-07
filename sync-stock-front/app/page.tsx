"use client"

import { NavigationProvider, useNavigation } from "@/lib/navigation-context"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { LoginScreen } from "@/components/screens/login-screen"
import { DashboardScreen } from "@/components/screens/dashboard-screen"
import { ProductsScreen } from "@/components/screens/products-screen"
import { ProductRegisterScreen } from "@/components/screens/product-register-screen"
import { StockMovementScreen } from "@/components/screens/stock-movement-screen"
import { ReportsScreen } from "@/components/screens/reports-screen"
import { UsersScreen } from "@/components/screens/users-screen"
import { SettingsScreen } from "@/components/screens/settings-screen"

function AppContent() {
  const { currentPage, isAuthenticated, isAuthLoading } = useNavigation()

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded border border-border bg-card px-6 py-5 text-sm text-muted-foreground shadow-xl shadow-black/30">
          Validando sessao...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  const screens: Record<string, React.ReactNode> = {
    dashboard: <DashboardScreen />,
    products: <ProductsScreen />,
    "product-register": <ProductRegisterScreen />,
    "stock-movement": <StockMovementScreen />,
    reports: <ReportsScreen />,
    users: <UsersScreen />,
    settings: <SettingsScreen />,
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="ml-60 flex flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 overflow-auto">
          {screens[currentPage] || <DashboardScreen />}
        </main>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  )
}
