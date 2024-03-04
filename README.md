# Fastify Starter Template

This is a fastify starter template with some batteries included, listed out below:

Includes features :

- Auth & OTP verification
- BullMQ for queues
- User CRUD & Role
- Global Error Handler with formatted response
- S3 / Object Storage Adapter
- Rate limiting on Route by IP
- Performant linting & formatting using rust based `Biome`

## Project Structure

- app contains all encapsulated functionalities
- handlers => app logic only, basically controllers => request sanitization & response data
- services => business logic only => database & cache operations
- schemas => request validation & response serialization

## Installation Steps

### Docker :

Install Docker and Docker Compose
Set the `.env` values before starting instances

```
docker compose up
```
