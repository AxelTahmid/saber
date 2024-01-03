# Fastify Starter Template

This is a fastify starter template with authentication, otp verification, mail queue, sql adapter. 

Includes features :

- Auth & OTP verification
- BullMQ for queues
- User CRUD & Role
- Global Error Handler with formatted response
- S3 / Object Storage Adapter
- Rate limiting on Route by IP

## Project Structure

- app contains all separated features
- handlers => app logic only => request sanitization & response data
- services => business logic only => database & cache operations
- schemas => request validation & response serialization

## Installation Steps

### Docker :

Install Docker and Docker Compose
Set the `.env` values before starting instances

```
docker compose up
```
