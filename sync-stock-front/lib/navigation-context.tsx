"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type Page =
  | "login"
  | "dashboard"
  | "products"
  | "product-register"
  | "stock-movement"
  | "reports"
  | "users"
  | "settings"

interface NavigationContextType {
  currentPage: Page
  navigate: (page: Page) => void
  isAuthenticated: boolean
  login: () => void
  logout: () => void
}

const NavigationContext = createContext<NavigationContextType | null>(null)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>("login")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  function navigate(page: Page) {
    setCurrentPage(page)
  }

  function login() {
    setIsAuthenticated(true)
    setCurrentPage("dashboard")
  }

  function logout() {
    setIsAuthenticated(false)
    setCurrentPage("login")
  }

  return (
    <NavigationContext.Provider
      value={{ currentPage, navigate, isAuthenticated, login, logout }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider")
  }
  return context
}
