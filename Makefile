.PHONY: check-env tls jwt up down fresh init dev exec-db log log-db db-refresh

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

# Generate self-signed TLS certificates (local development only)
tls:
	@echo "Generating TLS certificates..."
	cd certs && \
	openssl req -nodes -newkey rsa:2048 -new -x509 -keyout tls.key -out tls.crt -days 365 \
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
	openssl ecparam -genkey -name prime256v1 -noout -out jwt.pem && \
	openssl ec -in jwt.pem -pubout -out jwt.pem

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
	docker compose down --remove-orphans
	docker compose build --no-cache
	docker compose up -d --build -V
	log

# Development mode: tidy modules, restart containers, and follow logs
dev: down up log

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
	npx knex migrate:rollback --all --knexfile "$(PWD)/database/knexfile" --verbose --esm; \
	echo -e "$$GREEN*************************************************"; \
	echo -e "*  Migrating Tables                            *"; \
	echo -e "*************************************************$$NC"; \
	npx knex migrate:latest --knexfile "$(PWD)/database/knexfile" --verbose --esm; \
	echo -e "$$GREEN*************************************************"; \
	echo -e "*  Seeding Tables                              *"; \
	echo -e "*************************************************$$NC"; \
	npx knex seed:run --knexfile "$(PWD)/database/knexfile" --verbose --esm

