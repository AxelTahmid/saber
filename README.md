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

Install `Docker` and `Docker Compose`. This config uses Docker Compose V2. Also ensure `make` tools are availabel for you.
Set the `.env` values before starting instances

```sh
# start container
make dev

# enter container
make enter
# migrate from inside container
yarn migrate
yarn seed
```
