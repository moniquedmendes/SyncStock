"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import {
  fetchCurrentUser,
  loginWithCredentials,
  logoutCurrentUser,
  type AuthUser,
  type LoginCredentials,
} from "@/lib/auth-api"

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
  currentUser: AuthUser | null
  isAuthenticated: boolean
  isAuthLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
}

const NavigationContext = createContext<NavigationContextType | null>(null)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>("login")
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const isAuthenticated = currentUser !== null

  useEffect(() => {
    let active = true

    async function hydrateCurrentSession() {
      try {
        const user = await fetchCurrentUser()
        if (!active) {
          return
        }

        if (user) {
          setCurrentUser(user)
          setCurrentPage("dashboard")
          return
        }

        setCurrentUser(null)
        setCurrentPage("login")
      } catch (error) {
        if (!active) {
          return
        }

        console.error("Failed to hydrate auth session.", error)
        setCurrentUser(null)
        setCurrentPage("login")
      } finally {
        if (active) {
          setIsAuthLoading(false)
        }
      }
    }

    void hydrateCurrentSession()

    return () => {
      active = false
    }
  }, [])

  function navigate(page: Page) {
    setCurrentPage(page)
  }

  async function login(credentials: LoginCredentials) {
    const user = await loginWithCredentials({
      login: credentials.login.trim(),
      senha: credentials.senha,
    })

    setCurrentUser(user)
    setCurrentPage("dashboard")
  }

  async function logout() {
    try {
      await logoutCurrentUser()
    } finally {
      setCurrentUser(null)
      setIsAuthLoading(false)
      setCurrentPage("login")
    }
  }

  const value: NavigationContextType = {
    currentPage,
    navigate,
    currentUser,
    isAuthenticated,
    isAuthLoading,
    login,
    logout,
  }

  return (
    <NavigationContext.Provider value={value}>
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
