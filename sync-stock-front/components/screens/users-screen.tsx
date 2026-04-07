"use client"

import { useState } from "react"
import { Pencil, Trash2, UserPlus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const users = [
  {
    id: 1,
    name: "Carlos Silva",
    login: "carlos.silva",
    profile: "Administrador",
    status: "Ativo",
  },
  {
    id: 2,
    name: "Maria Oliveira",
    login: "maria.oliveira",
    profile: "Operador",
    status: "Ativo",
  },
  {
    id: 3,
    name: "Joao Santos",
    login: "joao.santos",
    profile: "Operador",
    status: "Ativo",
  },
  {
    id: 4,
    name: "Ana Costa",
    login: "ana.costa",
    profile: "Administrador",
    status: "Inativo",
  },
  {
    id: 5,
    name: "Pedro Ferreira",
    login: "pedro.ferreira",
    profile: "Operador",
    status: "Ativo",
  },
  {
    id: 6,
    name: "Lucia Mendes",
    login: "lucia.mendes",
    profile: "Operador",
    status: "Ativo",
  },
]

function UserForm() {
  const [name, setName] = useState("")
  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  const [profile, setProfile] = useState("")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="user-name" className="text-sm text-foreground">
          Nome
        </Label>
        <Input
          id="user-name"
          placeholder="Nome completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-10 border-border bg-secondary text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="user-login" className="text-sm text-foreground">
          Login
        </Label>
        <Input
          id="user-login"
          placeholder="nome.sobrenome"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          className="h-10 border-border bg-secondary text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="user-password" className="text-sm text-foreground">
          Senha
        </Label>
        <Input
          id="user-password"
          type="password"
          placeholder="Crie uma senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-10 border-border bg-secondary text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-sm text-foreground">Perfil</Label>
        <Select value={profile} onValueChange={setProfile}>
          <SelectTrigger className="h-10 w-full border-border bg-secondary text-foreground">
            <SelectValue placeholder="Selecione o perfil" />
          </SelectTrigger>
          <SelectContent className="border-border bg-card">
            <SelectItem value="Administrador">Administrador</SelectItem>
            <SelectItem value="Operador">Operador</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90">
        Salvar Usuario
      </Button>
    </div>
  )
}

export function UsersScreen() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Gestao de Usuarios
          </h2>
          <p className="text-sm text-muted-foreground">
            Gerencie os usuarios e permissoes do sistema
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <UserPlus className="mr-1.5 h-4 w-4" />
              Novo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-card text-foreground sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Cadastrar Usuario
              </DialogTitle>
            </DialogHeader>
            <UserForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-card-foreground">
            Usuarios do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs text-muted-foreground">
                  Nome
                </TableHead>
                <TableHead className="text-xs text-muted-foreground">
                  Login
                </TableHead>
                <TableHead className="text-xs text-muted-foreground">
                  Perfil
                </TableHead>
                <TableHead className="text-xs text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-xs text-muted-foreground text-right">
                  Acoes
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, i) => (
                <TableRow
                  key={user.id}
                  className={`border-border ${i % 2 === 0 ? "bg-card" : "bg-secondary/20"}`}
                >
                  <TableCell className="text-sm font-medium text-card-foreground">
                    {user.name}
                  </TableCell>
                  <TableCell className="text-sm font-mono text-muted-foreground">
                    {user.login}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        user.profile === "Administrador"
                          ? "border-none bg-primary/20 text-chart-2"
                          : "border-none bg-secondary text-muted-foreground"
                      }
                    >
                      {user.profile}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        user.status === "Ativo"
                          ? "border-none bg-emerald-900/30 text-emerald-400"
                          : "border-none bg-secondary text-muted-foreground"
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        aria-label={`Editar ${user.name}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive-foreground"
                        aria-label={`Excluir ${user.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
