# Fastify Starter Template

This is a fastify typescript starter template with some batteries included:

- Postgres with Knex.js
- Auth & OTP verification
- BullMQ for queue
- User CRUD & Role
- Global Error Handler with formatted response
- S3 / Object Storage Adapter
- Performant linting & formatting using rust based `Biome`

## Project Structure

```sh
PROJECT/
    ├── .vscode                      # VSCode Configs
    ├── .yarn/                       # Contains yarn script
    ├── cert/                        # Certificates & Keys
    ├── docs/                        # Project documentations
    │   └── bruno/                   # Bruno collection for exploring api
    ├── src/                         # Typescript code directory
    │   ├── app/                     # Encapsulted Applicaton Logic
    │   │   ├── auth/
    │   │   │   ├── handler.ts       # Http handler, validation & serialization
    │   │   │   ├── service.ts       # Business logic aka. service
    │   │   │   ├── repository.ts    # Encapsulated database interactions
    │   │   │   ├── router.ts        # Http routes specific to auth
    │   │   │   └── schema.ts        # Necessary schemas and type definitions
    │   │   └── routes.ts            # Route registration point
    │   ├── config/                  # Configuration
    │   │   ├── environment.ts       # Environment Configuration
    │   │   └── schema.ts            # Common Response Format Schema
    │   ├── database/
    │   │   ├── migrations/          # Migrations files for knex
    │   │   ├── seeds/               # Seeder files for knex
    │   │   └── knexfile.ts          # Knexfile for dev purposes
    │   ├── plugins/
    │   │   └──  *.ts                # Custom fastify plugins & types
    │   └── server.ts                # Server entrypoint
    ├── .gitignore                   # Gitignore file
    ├── Makefile                     # Runnable Scripts
    ├── biome.json                   # Biome configs
    ├── docker-compose.yml           
    ├── Dockerfile                   
    ├── LICENSE                   
    ├── package.json                 
    ├── tsconfig.json
    └──├── yarn.lock
```

## Architechture
This follows a N-Tier Architechture

- schemas => schema and static types
- handlers => request sanitization, validation & respond
- services => application and business logic
- repository => database access layer

## Get Started - Development

### Environment

Ensure following tools available in your machine

-   Docker >= v27
-   Docker Compose >=v2.29
-   OpenSSL >= 1.1.1
-   Node.js >= V22
-   Yarn

### Server

To run the development server use below command:

```sh
make init
```

This command will

-   Copy `.env.example` to `.env`, filling in default values
-   Generate TLS cert for serving https locally.
-   Generate ECDSA public-private key pair for JWT Auth locally.
-   Start development server in hot reload mode

After running above command for the first time, you should only start development server in hot reload mode using below command

```sh
make dev
```

n.b. In production environment, mount your certificates in `cert` directory, ensure proper name & path supplied in env.

### Exploring APIs

[Bruno](https://github.com/usebruno/bruno) is an Opensource IDE For Exploring and Testing Api's, lightweight alternative to postman/insomnia. Open Directory `docs/bruno` from the bruno app & the collection will show up. Choose the environment `Local`.

Download & install bruno -> [click here](https://www.usebruno.com/downloads).

### Other Commands

run the development server with hot reload

```sh
yarn dev
```

run migration of postgresql database, ensure `.env` values are correctly given

```sh
yarn migrate-up
```

create migration files

```sh
yarn migrate-create <filename>
```

Generate TLS cert for serving https locally.

```sh
make tls
```

Generate ECDSA public-private key pair for JWT Auth locally.

```sh
make jwt
```

Run linter

```sh
make lint
```