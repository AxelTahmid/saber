
build:
	docker compose up -d --build --no-cache

up:
	docker compose up -d

down:
	docker compose down

dev: down up log

enter:
	docker exec -it acs-api sh

enter-db:
	docker exec -it acs-db sh

log:
	docker logs --follow acs-api

log-db:
	docker logs --follow acs-db

build-api:
	docker build --target dev -t acs-api .

start-api:
	docker run --env-file ./.env --expose 3000  --rm --network=host acs-api
