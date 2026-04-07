"use client"

export interface AuthUser {
  nome: string
  login: string
  perfil: string
}

export interface LoginCredentials {
  login: string
  senha: string
}

export class AuthApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "AuthApiError"
    this.status = status
  }
}

interface ProblemPayload {
  title?: string
  detail?: string
}

async function readProblemPayload(response: Response): Promise<ProblemPayload | null> {
  const contentType = response.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    return null
  }

  try {
    return (await response.json()) as ProblemPayload
  } catch {
    return null
  }
}

function toErrorMessage(problem: ProblemPayload | null, fallback: string): string {
  return problem?.detail ?? problem?.title ?? fallback
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch("/api/auth/me", {
    cache: "no-store",
    credentials: "include",
  })

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    const problem = await readProblemPayload(response)
    throw new AuthApiError(
      toErrorMessage(problem, "Nao foi possivel validar a sessao atual."),
      response.status,
    )
  }

  return (await response.json()) as AuthUser
}

export async function loginWithCredentials(
  credentials: LoginCredentials,
): Promise<AuthUser> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const problem = await readProblemPayload(response)
    throw new AuthApiError(
      toErrorMessage(problem, "Nao foi possivel concluir o login."),
      response.status,
    )
  }

  return (await response.json()) as AuthUser
}

export async function logoutCurrentUser(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  })

  if (response.status === 401) {
    return
  }

  if (!response.ok) {
    const problem = await readProblemPayload(response)
    throw new AuthApiError(
      toErrorMessage(problem, "Nao foi possivel encerrar a sessao."),
      response.status,
    )
  }
}
