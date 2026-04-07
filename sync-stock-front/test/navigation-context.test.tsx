import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { NavigationProvider, useNavigation } from "@/lib/navigation-context"
import { jsonResponse } from "@/test/auth-helpers"

function BrokenConsumer() {
  useNavigation()
  return null
}

function NavigationHarness() {
  const { currentPage, currentUser, isAuthenticated, isAuthLoading, login, logout, navigate } = useNavigation()

  return (
    <div>
      <span data-testid="page">{currentPage}</span>
      <span data-testid="auth">{String(isAuthenticated)}</span>
      <span data-testid="loading">{String(isAuthLoading)}</span>
      <span data-testid="user">{currentUser?.login ?? "anonymous"}</span>
      <button onClick={() => void login({ login: "admin", senha: "admin123" })}>login</button>
      <button onClick={() => navigate("products")}>products</button>
      <button onClick={() => void logout()}>logout</button>
    </div>
  )
}

describe("NavigationProvider", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("bootstraps from /api/auth/me, logs in, navigates, and logs out again", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse(
          { title: "Unauthorized" },
          { status: 401 },
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse(
          { nome: "Administrador", login: "admin", perfil: "Admin" },
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse(
          { nome: "Administrador", login: "admin", perfil: "Admin" },
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }))

    vi.stubGlobal("fetch", fetchMock)

    render(
      <NavigationProvider>
        <NavigationHarness />
      </NavigationProvider>,
    )

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"))
    expect(screen.getByTestId("page")).toHaveTextContent("login")
    expect(screen.getByTestId("auth")).toHaveTextContent("false")
    expect(screen.getByTestId("user")).toHaveTextContent("anonymous")

    fireEvent.click(screen.getByRole("button", { name: "login" }))
    await waitFor(() => expect(screen.getByTestId("page")).toHaveTextContent("dashboard"))
    expect(screen.getByTestId("auth")).toHaveTextContent("true")
    expect(screen.getByTestId("user")).toHaveTextContent("admin")

    fireEvent.click(screen.getByRole("button", { name: "products" }))
    expect(screen.getByTestId("page")).toHaveTextContent("products")

    fireEvent.click(screen.getByRole("button", { name: "logout" }))
    await waitFor(() => expect(screen.getByTestId("page")).toHaveTextContent("login"))
    expect(screen.getByTestId("auth")).toHaveTextContent("false")
    expect(screen.getByTestId("user")).toHaveTextContent("anonymous")

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/auth/me",
      expect.objectContaining({
        cache: "no-store",
        credentials: "include",
      }),
    )
  })

  it("throws when the hook is used outside the provider", () => {
    expect(() => render(<BrokenConsumer />)).toThrow(
      "useNavigation must be used within NavigationProvider",
    )
  })

  it("hydrates an existing authenticated session from /api/auth/me", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        jsonResponse(
          { nome: "Administrador", login: "admin", perfil: "Admin" },
          { status: 200 },
        ),
      ),
    )

    render(
      <NavigationProvider>
        <NavigationHarness />
      </NavigationProvider>,
    )

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"))
    expect(screen.getByTestId("auth")).toHaveTextContent("true")
    expect(screen.getByTestId("page")).toHaveTextContent("dashboard")
    expect(screen.getByTestId("user")).toHaveTextContent("admin")
  })
})
