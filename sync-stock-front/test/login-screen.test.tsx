import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { LoginScreen } from "@/components/screens/login-screen"
import { NavigationProvider } from "@/lib/navigation-context"
import { jsonResponse } from "@/test/auth-helpers"

describe("LoginScreen", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("shows an api error message when login fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>()
        .mockResolvedValueOnce(
          jsonResponse(
            { title: "Unauthorized" },
            { status: 401 },
          ),
        )
        .mockResolvedValueOnce(
          jsonResponse(
            {
              title: "Invalid credentials",
              detail: "The provided login or password is invalid.",
            },
            { status: 401 },
          ),
        ),
    )

    render(
      <NavigationProvider>
        <LoginScreen />
      </NavigationProvider>,
    )

    await waitFor(() => expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled())

    fireEvent.change(screen.getByLabelText("Usuario"), {
      target: { value: "admin" },
    })
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "senha-errada" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }))

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "The provided login or password is invalid.",
      ),
    )
  })
})
