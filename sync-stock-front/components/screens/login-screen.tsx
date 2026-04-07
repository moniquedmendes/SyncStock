"use client"

import { useState } from "react"
import { Cog, Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useNavigation } from "@/lib/navigation-context"

export function LoginScreen() {
  const { isAuthLoading, login } = useNavigation()
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const normalizedUsername = username.trim()

    if (!normalizedUsername || !password) {
      setErrorMessage("Informe usuario e senha para continuar.")
      return
    }

    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      await login({
        login: normalizedUsername,
        senha: password,
      })
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel entrar agora. Tente novamente.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/40 via-background to-background" />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="rounded border border-border bg-card p-8 shadow-2xl shadow-black/40">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded bg-primary">
              <Cog className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Sync Stock
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Sistema de Gestao de Estoque Inteligente
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {errorMessage ? (
              <div
                role="alert"
                className="rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {errorMessage}
              </div>
            ) : null}

            <div className="flex flex-col gap-2">
              <Label htmlFor="username" className="text-sm text-foreground">
                Usuario
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Digite seu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-10 border-border bg-secondary text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-sm text-foreground">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 border-border bg-secondary pr-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs text-muted-foreground transition-colors hover:text-chart-2"
                >
                  Esqueceu a senha?
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || isAuthLoading}
              className="h-10 w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Sync Stock v1.0 - Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  )
}
