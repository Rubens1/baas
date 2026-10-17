# LeraPay — BaaS local

Projeto de uma plataforma local de **Banking as a Service (BaaS)**. A aplicação reúne um painel web para lojistas e uma API que mantém contas, sessões, checkouts, taxas, carteiras e movimentações em um banco MySQL.

> **Modo de demonstração:** não há integração com provedores de pagamento ou bancos. Pagamentos podem ser simulados pela API e saques são registrados como transferências internas no ledger; não movimentam dinheiro real.

## Funcionalidades

- Cadastro de lojistas pessoa física (PF) ou jurídica (PJ), com criação automática de carteira.
- Login e logout com sessão local e rotas protegidas.
- Painel com saldo disponível e bloqueado, recebimentos do mês, quantidade de transações e movimentações recentes.
- Criação de checkouts para PIX e cartão, com consulta de taxas por método, bandeira e parcelas.
- Cadastro de taxas pelo painel para PIX e cartão, com aplicação automática em novos checkouts.
- Simulação do resultado de pagamentos — aprovado, negado, expirado ou cancelado — atualizando checkout, transação e saldo de forma transacional.
- Consulta do extrato e registro de saques/transferências locais, com validação de saldo disponível.

## Tecnologias

- **Frontend:** React 19, Vite e JavaScript.
- **Backend:** NestJS 12, TypeORM e TypeScript.
- **Banco de dados:** MySQL.
- **Gerenciadores:** pnpm (cada aplicação tem seu próprio `package.json`).

## Pré-requisitos

- Node.js compatível com as dependências do projeto.
- pnpm.
- MySQL disponível e credenciais para criar/acessar o banco.

## Configuração e execução

### 1. Preparar o banco e a API

Crie um arquivo `backend/.env` com as credenciais do seu MySQL:

```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=lerapay
```

Crie o banco informado em `DB_NAME` e execute, **nessa ordem**, os scripts SQL:

1. [`000_wallets_and_transactions.sql`](./backend/database/migrations/000_wallets_and_transactions.sql)
2. [`001_local_payments.sql`](./backend/database/migrations/001_local_payments.sql)
3. [`002_local_accounts_and_fees.sql`](./backend/database/migrations/002_local_accounts_and_fees.sql)

As migrações criam as tabelas de carteiras, transações, checkouts, saques, lojistas, sessões e taxas. O TypeORM está configurado com `synchronize: false`; as tabelas devem ser criadas pelas migrações.

Em um terminal:

```powershell
cd backend
pnpm install
pnpm start:dev
```

A API inicia por padrão em `http://localhost:3333`. A documentação Swagger fica em [`http://localhost:3333/api/docs`](http://localhost:3333/api/docs).

### 2. Executar o painel

Em outro terminal, crie `frontend/.env` para apontar o painel à API:

```dotenv
VITE_API_URL=http://localhost:3333/api
```

Então inicie o Vite:

```powershell
cd frontend
pnpm install
pnpm dev
```

Abra o endereço local mostrado pelo Vite. Cadastre um lojista pela tela de cadastro e entre com as credenciais criadas.

## API

As rotas usam o prefixo `/api`. Cadastro e login são públicos; as demais rotas exigem uma sessão no cabeçalho `Authorization: Bearer <token>`.

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/api/users` | Cadastra lojista e cria carteira |
| `POST` | `/api/auth/login` | Inicia sessão |
| `POST` | `/api/auth/logout` | Encerra sessão |
| `GET` | `/api/fees` | Consulta taxas configuradas |
| `POST` | `/api/fees` | Cadastra a taxa de um método, bandeira e número de parcelas |
| `PATCH` | `/api/fees/:id` | Edita o percentual de uma taxa existente |
| `POST` | `/api/checkouts` | Cria checkout PIX ou cartão |
| `GET` | `/api/checkouts` | Lista checkouts do lojista autenticado |
| `GET` | `/api/checkouts/:id` | Consulta um checkout |
| `PATCH` | `/api/checkouts/:id/simulate-payment` | Simula o resultado do pagamento |
| `GET` | `/api/wallet` | Consulta a carteira |
| `GET` | `/api/wallet/summary` | Consulta o resumo financeiro do painel |
| `GET` | `/api/wallet/transactions` | Consulta o extrato |
| `POST` | `/api/withdrawals` | Registra uma transferência local |
| `GET` | `/api/withdrawals` | Lista transferências locais |
| `GET` | `/api/withdrawals/:id` | Consulta uma transferência |

## Limitações do modo local

- O identificador PIX `BAAS-LOCAL:...` é apenas uma referência de demonstração; não é um código PIX válido nem gera QR Code de pagamento real.
- A simulação de checkout não autoriza cobrança em cartão, recebe pagamentos PIX ou processa webhooks de liquidação.
- Saques são lançamentos locais no saldo e no extrato; não são enviados a instituições financeiras.

## Testes e build

Backend:

```powershell
cd backend
pnpm test
pnpm test:e2e
pnpm build
```

Frontend:

```powershell
cd frontend
pnpm build
```
