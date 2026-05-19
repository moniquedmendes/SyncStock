"use client"

export interface DashboardMovement {
  id: number
  productId: number
  productCode: string
  productName: string
  type: "Entrada" | "Saida"
  quantity: number
  date: string
  observation: string
}

export interface DashboardMonthlyMovement {
  month: string
  entries: number
  exits: number
}

export interface DashboardCategoryStock {
  category: string
  quantity: number
}

export interface DashboardSummary {
  totalProducts: number
  lowStockProducts: number
  monthlyMovementCount: number
  activeSuppliers: number
  totalStockItems: number
  totalStockValue: number
  averageMovementsPerDay: number
  recentMovements: DashboardMovement[]
  monthlyMovements: DashboardMonthlyMovement[]
  categoryStock: DashboardCategoryStock[]
}

export class DashboardApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "DashboardApiError"
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

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const response = await fetch("/api/dashboard/summary", {
    cache: "no-store",
    credentials: "include",
  })

  if (!response.ok) {
    const problem = await readProblemPayload(response)
    throw new DashboardApiError(
      problem?.detail ?? problem?.title ?? "Nao foi possivel carregar o dashboard.",
      response.status,
    )
  }

  return (await response.json()) as DashboardSummary
}
