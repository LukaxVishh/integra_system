# Integra System

> Plataforma web para gerenciar serviços da cooperativa Sicredi Integração PR/SC.

## 🧾 Descrição

O **Integra System** é uma plataforma onde os colaboradores do Sicredi Integração PR/SC poderão obter informações que os auxiliem na tomada de decisão no momento da definição de negócios, tambem será possivel se ater das informações mais atualizadas da cooperativa entre outros serviços planejados

---

## 👥 Desenvolvido por

- Lucas Antonio Domingues de Souza Oliveira - [LukaxVishh](https://github.com/LukaxVishh)

---

## 🛠️ Tecnologias Utilizadas

- **Linguagem Backend:** C# (.NET 8)
- **Framework Backend:** ASP.NET Core
- **ORM:** Entity Framework Core
- **Frontend:** React.ts
- **Autenticação:** Identity Framework Core
- **Banco de Dados:** Postgres
- **Versionamento:** Git + GitHub, GitLab

---

## 🚀 Como Executar o Projeto

### Pré-requisitos

- [.NET SDK 8.0+](https://dotnet.microsoft.com/en-us/download)
- Node.js 18+
- Postgres instalado
- Git instalado

### Passos

#### 🔧 Backend

```bash
# 1. Clone o repositório
git clone git@github.com:LukaxVishh/integra_system.git

# 2. Acesse a pasta do backend
cd integra_system.backend

# 3. Restaure os pacotes
dotnet restore

# 4. Atualize o banco de dados
dotnet ef database update

# 5. Execute a aplicação
dotnet run
```

#### 💻 Frontend

```bash
# 1. Acesse a pasta do frontend
cd integra_system.frontend

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run start
```

---

## 🔑 Variáveis de Ambiente

### Backend `appsettings.Development.json`

```
  "ConnectionStrings": {
    "DefaultConnection": "server=; database=IntegraSystem; user=; password=;"
  },
```
