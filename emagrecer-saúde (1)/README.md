# Portal de Emagrecimento e Saúde - Full-Stack App

Este é um portal completo e moderno de reeducação alimentar, saúde e treinos fitness. O sistema possui uma área administrativa, e-book interativo, calculadoras metabólicas, montador visual de pratos saudáveis, diários de treinos, diário de progresso com gráficos de pesagem e sincronização de treinos automática com o Google Calendar.

O projeto foi projetado seguindo as melhores práticas de Clean Code, SOLID e modularidade, integrando o **React (Vite) com TypeScript** no frontend e **Node.js (Express) com TypeScript e Prisma ORM** no backend em uma arquitetura unificada de alta performance.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 19, Vite, TypeScript, TailwindCSS v4, Motion (para transições fluidas e micro-animações).
- **Backend:** Node.js, Express, TypeScript, JWT (JSON Web Tokens) com Refresh Tokens.
- **Banco de Dados:** PostgreSQL com Prisma ORM (para produção). Suporte local a SQLite para desenvolvimento rápido sem configuração adicional.
- **Segurança:** Helmet (com políticas de cabeçalhos ajustadas), CORS, bcryptjs.

---

## 📁 Estrutura do Projeto

O projeto utiliza uma arquitetura full-stack integrada de alto desempenho que roda em um único servidor Express. Em ambiente de desenvolvimento, o Vite é acoplado ao Express como middleware (compartilhando a porta 3000), garantindo desenvolvimento ágil e sem problemas de CORS. Em produção, os ativos estáticos são compilados para `dist/` e servidos de forma otimizada pelo Express.

```text
/
├── prisma/                 # Schema do Prisma ORM e banco de dados local
│   └── schema.prisma       # Definição dos modelos e conexão PostgreSQL
├── config/                 # Configurações do servidor (ex: conexão com o banco de dados)
├── controllers/            # Controladores da API (lógica de negócios)
├── routes/                 # Definição das rotas REST (/api/*)
├── middlewares/            # Middlewares de Express (ex: proteção de rotas via JWT)
├── services/               # Serviços utilitários (ex: gerenciamento de tokens JWT)
├── src/                    # Código-fonte do frontend (React)
│   ├── components/         # Componentes visuais premium com Glassmorphism
│   ├── data/               # Conteúdo do livro e dados estáticos
│   ├── App.tsx             # Componente raiz do frontend
│   └── main.tsx            # Ponto de entrada do cliente Vite
├── server.ts               # Servidor Express unificado (Backend + Middleware Vite)
├── render.yaml             # Arquivo de configuração de infraestrutura (Render Infrastructure-as-Code)
└── package.json            # Scripts de build, dev, start e dependências
```

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
- Node.js (v18 ou superior)
- npm (v10 ou superior)

### 2. Instalação de Dependências
Clone o repositório ou extraia os arquivos, acesse o diretório raiz e execute:
```bash
npm install
```

### 3. Configuração de Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto (copie o modelo de `.env.example` se disponível):
```env
# Banco de Dados (SQLite por padrão para desenvolvimento local rápido)
DATABASE_URL="file:./dev.db"

# Segredos JWT para criptografia e autenticação segura de sessões
JWT_SECRET="seu_jwt_secret_super_secreto_aqui"
JWT_REFRESH_SECRET="seu_jwt_refresh_secret_super_secreto_aqui"

# Configurações opcionais da Kiwify para integração de Webhooks de vendas
KIWIFY_SECRET_TOKEN="token_do_webhook_kiwify"
```

### 4. Inicialização do Banco de Dados Local
Rode o comando do Prisma para sincronizar o schema localmente (criando as tabelas e gerando o cliente Prisma):
```bash
npx prisma db push
```

### 5. Execução em Modo de Desenvolvimento
Inicie o servidor de desenvolvimento:
```bash
npm run dev
```
O portal estará disponível em `http://localhost:3000` com suporte a recarga rápida.

---

## 🗄️ Gerenciamento do Banco de Dados com Prisma

- **Sincronizar o Banco:** Sempre que houver mudanças no schema (`prisma/schema.prisma`), execute:
  ```bash
  npx prisma db push
  ```
- **Visualizar Dados Visualmente (Prisma Studio):** Para visualizar e editar os usuários, logs de acesso e dispositivos ativos através de uma interface web local:
  ```bash
  npx prisma studio
  ```
- **Gerar Migrations (Se necessário usar migrations em produção):**
  ```bash
  npx prisma migrate dev --name init
  ```

---

## 🌐 Configuração e Deploy Passo a Passo na Render

Esta aplicação foi totalmente otimizada e testada para rodar de forma automática na **Render**. O deploy é realizado criando um **Web Service** em Node.js com banco de dados **PostgreSQL**.

### Configurações Necessárias no Painel da Render

Ao criar um novo **Web Service** na Render, configure os seguintes campos exatamente como listado abaixo:

| Campo do Painel Render | Valor Recomendado | Descrição |
| :--- | :--- | :--- |
| **Root Directory** | `.` *(deixe em branco ou digite ponto)* | **CRÍTICO:** O diretório raiz do projeto. Não coloque `src/` ou subpastas, pois o arquivo `package.json` está na raiz do repositório. |
| **Runtime** | `Node` | O ambiente de execução do servidor Express. |
| **Build Command** | `npm install --include=dev && npm run build:render` | Comando de compilação robusto. Instala todas as dependências (incluindo dev), altera o provedor do Prisma para PostgreSQL de forma segura, gera o Prisma Client, compila o frontend Vite para `dist/` e empacota o backend com esbuild. |
| **Start Command** | `npm run start` | Sincroniza o schema do banco PostgreSQL (`prisma db push`) e inicia o servidor Express unificado em produção (`node dist/server.cjs`). |

### Variáveis de Ambiente (Environment Variables na Render)

Adicione as seguintes variáveis de ambiente na aba **Env Groups** ou diretamente nas configurações do Web Service:

1. **`NODE_ENV`**: `production`
2. **`DATABASE_URL`**: `postgresql://usuario:senha@host:porta/banco?sslmode=require`  
   *(Se você criar o banco de dados PostgreSQL diretamente na Render, basta copiar a **External Connection String** fornecida por ela e colar aqui)*
3. **`JWT_SECRET`**: Insira uma string aleatória longa e segura para assinar os tokens JWT.
4. **`JWT_REFRESH_SECRET`**: Insira outra string longa e segura para assinar os tokens de atualização (Refresh Tokens).

---

## 🔒 Lógica de Autenticação e Seed de Administradores

Para evitar problemas de login em produção, o sistema realiza um **Auto-Seed de Administradores** na inicialização do servidor. 

Toda vez que a aplicação é iniciada (`npm run start`), ela verifica a existência das contas de administrador. Se as contas não existirem no banco de dados, elas são criadas automaticamente com o e-mail cadastrado e a senha padrão criptografada de forma segura com **bcryptjs**.

Os administradores padrão pré-configurados são:
1. **Admin Noctivus:** `noctivusoct@gmail.com`
2. **Admin Kauan:** `kauansouza.vasc@gmail.com`

- **Senha Padrão Inicial:** `29042003KaUaN@@`  
*(Lembre-se de alterar as senhas ou cadastrar novos usuários de suporte através do painel de administração uma vez autenticado)*

---

## 🛠️ Como Atualizar Dependências

Se você precisar instalar novas bibliotecas para o frontend ou backend, faça diretamente na raiz do projeto:
```bash
# Exemplo para instalar uma nova biblioteca
npm install nome-da-biblioteca

# Exemplo para instalar pacotes de desenvolvimento
npm install --save-dev @types/nome-da-biblioteca
```
Devido à arquitetura empacotada com `esbuild`, qualquer nova dependência instalada no `package.json` será automaticamente processada durante a etapa de build da Render.
