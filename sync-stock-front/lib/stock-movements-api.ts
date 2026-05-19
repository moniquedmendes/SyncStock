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

export interface StockMovementHistoryItem {
  id: number
  productId: number
  productCode: string
  productName: string
  type: StockMovementType
  quantity: number
  date: string
  observation: string
}

export interface StockMovementList {
  items: StockMovementHistoryItem[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface StockMovementQuery {
  productId?: number
  type?: StockMovementType
  from?: string
  to?: string
  page?: number
  pageSize?: number
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

function toMovementQueryString(query: StockMovementQuery = {}): string {
  const params = new URLSearchParams()

  if (query.productId) {
    params.set("productId", String(query.productId))
  }

  if (query.type) {
    params.set("type", query.type)
  }

  if (query.from) {
    params.set("from", query.from)
  }

  if (query.to) {
    params.set("to", query.to)
  }

  if (query.page) {
    params.set("page", String(query.page))
  }

  if (query.pageSize) {
    params.set("pageSize", String(query.pageSize))
  }

  const queryString = params.toString()
  return queryString ? `?${queryString}` : ""
}

export async function fetchStockMovements(
  query?: StockMovementQuery,
): Promise<StockMovementList> {
  const response = await fetch(`/api/stock-movements${toMovementQueryString(query)}`, {
    cache: "no-store",
    credentials: "include",
  })

  if (!response.ok) {
    const problem = await readProblemPayload(response)
    throw new StockMovementsApiError(
      problem?.detail ?? problem?.title ?? "Nao foi possivel carregar as movimentacoes.",
      response.status,
    )
  }

  return (await response.json()) as StockMovementList
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
