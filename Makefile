.PHONY: check-env tls keys jwt up down fresh init dev exec-db log log-db db-refresh

# Load .env file if it exists
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

# ----------------------------------------------------------------------
# Environment Setup
# ----------------------------------------------------------------------

# Ensure .env exists; if not, copy from .env.example
check-env:
	@test -f .env || cp .env.example .env

# ----------------------------------------------------------------------
# Certificate and Key Generation
# ----------------------------------------------------------------------

keys: jwt tls

# Generate self-signed TLS certificates (local development only)
tls:
	@echo "Generating TLS certificates..."
	cd certs && \
	MSYS_NO_PATHCONV=1 openssl req -nodes -newkey rsa:2048 -new -x509 -keyout tls.key -out tls.crt -days 365 \
	-subj "/C=BD/ST=Dhaka/L=Dhaka/O=Golang/CN=localhost"

# Generate JWT keys
jwt:
	@echo "Generating JWT keys..."
	openssl_minversion=1.1.1; \
	if echo -e "$$(openssl version | awk '{print $$2}')\n$${openssl_minversion}" | sort -V | head -1 | grep -q "^$${openssl_minversion}$$"; then \
		echo "openssl - okay"; \
		echo "generating P-256 ECDSA key pair"; \
	else \
		echo "openssl not found or supported"; \
	fi; \
	cd certs && \
	openssl ecparam -genkey -name prime256v1 -noout -out private.pem && \
	openssl ec -in private.pem -pubout -out public.pem

# ----------------------------------------------------------------------
# Docker Management
# ----------------------------------------------------------------------

up:
	docker compose up -d

down:
	docker compose down

fresh: 
	check-env
	docker compose down --remove-orphans
	docker compose build --no-cache
	docker compose up -d --build -V
	log

init:
	check-env
	tls
	jwt
	yarn install
	npx lefthook install
	docker compose down --remove-orphans
	docker compose build --no-cache
	docker compose up -d --build -V
	log

# Development mode: tidy modules, restart containers, and follow logs
dev: down up log

enter:
	docker exec -it api sh

# Open a shell in the database container
exec-db:
	docker compose exec -it db sh

# Follow logs for API and database containers
log:
	docker logs -f api

log-db:
	docker logs -f db

# ----------------------------------------------------------------------
# Database Scripts
# ----------------------------------------------------------------------
knex := npx tsx ./node_modules/knex/bin/cli.js --knexfile="$(PWD)/src/database/knexfile"

db-refresh:
	@GRAY="\033[1;36m"; \
	GREEN="\033[0;32m"; \
	NC="\033[0m"; \
	echo -e "$$GRAY*************************************************"; \
	echo -e "*                                               *"; \
	echo -e "*              DATABASE REFRESH                 *"; \
	echo -e "*                                               *"; \
	echo -e "*************************************************$$NC"; \
	echo ""; \
	sleep 1; \
	echo -e "$$GREEN*************************************************"; \
	echo -e "*  Rolling Back Migrations if Exists           *"; \
	echo -e "*************************************************$$NC"; \
	$(knex) migrate:rollback --all --verbose; \
	echo -e "$$GREEN*************************************************"; \
	echo -e "*  Migrating Tables                            *"; \
	echo -e "*************************************************$$NC"; \
	$(knex) migrate:latest --verbose; \
	echo -e "$$GREEN*************************************************"; \
	echo -e "*  Seeding Tables                              *"; \
	echo -e "*************************************************$$NC"; \
	$(knex) seed:run --verbose

