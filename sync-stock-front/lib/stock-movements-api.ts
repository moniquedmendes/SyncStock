"use client"

export type StockMovementType = "Entrada" | "Saida"

export interface CreateStockMovementInput {
  productId: number
  type: StockMovementType
  quantity: number
  date: string
  observation: string
}

export interface StockMovement {
  id: number
  productId: number
  productName: string
  type: StockMovementType
  quantity: number
  date: string
  observation: string
  resultingStock: number
}

export class StockMovementsApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "StockMovementsApiError"
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

function toErrorMessage(problem: ProblemPayload | null): string {
  return problem?.detail ?? problem?.title ?? "Nao foi possivel registrar a movimentacao."
}

export async function createStockMovement(
  input: CreateStockMovementInput,
): Promise<StockMovement> {
  const response = await fetch("/api/stock-movements", {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const problem = await readProblemPayload(response)
    throw new StockMovementsApiError(toErrorMessage(problem), response.status)
  }

  return (await response.json()) as StockMovement
}
