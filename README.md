# 📦 Sistema de Controle de Estoque

Sistema web de controle de estoque desenvolvido utilizando **ASP.NET Core MVC**.
O objetivo do projeto é gerenciar produtos, movimentações de entrada e saída e usuários do sistema.

---

# 🚀 Tecnologias Utilizadas

* ASP.NET Core MVC
* C#
* Entity Framework Core
* SQL Server
* Sessions para controle de autenticação
* 
* 

---

# 📋 Funcionalidades

### 🔐 Autenticação

* Login de usuário
* Controle de sessão


### 📊 Dashboard

* Tela inicial com mensagem de boas-vindas
* Exibição do nome do usuário autenticado

### 📦 Gestão de Produtos

* Cadastro de produtos
* Listagem de produtos
* Edição de produtos
* Exclusão de produtos

### 🔄 Movimentação de Estoque

* Registro de entrada de produtos
* Registro de saída de produtos
* Atualização automática da quantidade em estoque

### 👤 Gestão de Usuários

* Cadastro de usuários
* Controle de acesso ao sistema

---

# 🧠 Estrutura do Projeto

```
/Controllers
    AuthController
    HomeController
    ProdutoController
    MovimentacaoController
    UsuarioController

/Models
    Usuario
    Produto
    Movimentacao

/Views
    /Auth
    /Home
    /Produto
    /Movimentacao
    

/Data
    ApplicationDbContext

/wwwroot
```

---

# 📌 Melhorias Futuras

* Controle de níveis de acesso (Admin / Usuário)
* Histórico de movimentações
* Relatórios de estoque
* Dashboard com gráficos
* Exportação de relatórios

---


