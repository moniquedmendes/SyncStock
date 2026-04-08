"use client"

export interface Product {
  id: number
  codigo: string
  nome: string
  categoria: string
  marca: string
  fornecedor: string
  preco: number
  quantidadeEstoque: number
  estoqueMinimo: number
  statusEstoque: string
}

export interface CreateProductInput {
  codigo: string
  nome: string
  categoria: string
  marca: string
  fornecedor: string
  preco: number
  quantidadeEstoque: number
  estoqueMinimo: number
}

export class ProductsApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ProductsApiError"
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

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch("/api/products", {
    cache: "no-store",
    credentials: "include",
  })

  if (!response.ok) {
    const problem = await readProblemPayload(response)
    throw new ProductsApiError(
      toErrorMessage(problem, "Nao foi possivel carregar os produtos."),
      response.status,
    )
  }

  return (await response.json()) as Product[]
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const response = await fetch("/api/products", {
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
    throw new ProductsApiError(
      toErrorMessage(problem, "Nao foi possivel salvar o produto."),
      response.status,
    )
  }

  return (await response.json()) as Product
}
