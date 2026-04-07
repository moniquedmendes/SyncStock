import { fireEvent, render, screen } from "@testing-library/react"
import { NavigationProvider, useNavigation } from "@/lib/navigation-context"

function BrokenConsumer() {
  useNavigation()
  return null
}

function NavigationHarness() {
  const { currentPage, isAuthenticated, login, logout, navigate } = useNavigation()

  return (
    <div>
      <span data-testid="page">{currentPage}</span>
      <span data-testid="auth">{String(isAuthenticated)}</span>
      <button onClick={() => login()}>login</button>
      <button onClick={() => navigate("products")}>products</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  )
}

describe("NavigationProvider", () => {
  it("starts logged out, logs in, navigates, and logs out again", () => {
    render(
      <NavigationProvider>
        <NavigationHarness />
      </NavigationProvider>,
    )

    expect(screen.getByTestId("page")).toHaveTextContent("login")
    expect(screen.getByTestId("auth")).toHaveTextContent("false")

    fireEvent.click(screen.getByRole("button", { name: "login" }))
    expect(screen.getByTestId("page")).toHaveTextContent("dashboard")
    expect(screen.getByTestId("auth")).toHaveTextContent("true")

    fireEvent.click(screen.getByRole("button", { name: "products" }))
    expect(screen.getByTestId("page")).toHaveTextContent("products")

    fireEvent.click(screen.getByRole("button", { name: "logout" }))
    expect(screen.getByTestId("page")).toHaveTextContent("login")
    expect(screen.getByTestId("auth")).toHaveTextContent("false")
  })

  it("throws when the hook is used outside the provider", () => {
    expect(() => render(<BrokenConsumer />)).toThrow(
      "useNavigation must be used within NavigationProvider",
    )
  })
})
