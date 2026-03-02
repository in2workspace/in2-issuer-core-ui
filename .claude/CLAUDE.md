# CLAUDE.md — Issuer Core UI

## Shared Context

Shared agents, protocol docs, and skills live in `.claude/shared/` (git submodule).

- Agents: `.claude/shared/agents/` (developer, reviewer)
- Protocol specs: `.claude/shared/docs/protocols/` (OID4VCI gap analysis, SD-JWT, credential JSON schema)
- Normative references: `.claude/shared/docs/standards/references.md`
- Skills: `.claude/shared/skills/` (java-spring-hexagonal, angular)

## Project Overview

Spring Boot 3.5.10 + WebFlux (reactive) implementation of an OID4VCI Credential Issuer.
Package: `es.in2.issuer`, version 2.2.19. Java 25, Gradle, PostgreSQL (R2DBC), Flyway.

## Architecture

Hexagonal (Ports & Adapters) + DDD. Four bounded contexts:

- **oidc4vci/** - OID4VCI protocol endpoints (metadata, token, credential, offer, deferred, notification)
- **backoffice/** - Admin UI backend (issuance management, signature config, security config)
- **signing/** - Pluggable signing SPI (InMemory, CscSignHash, CscSignDoc)
- **statuslist/** - Credential revocation via Bitstring Status Lists
- **shared/** - Cross-cutting: models, crypto, factories, security services

Each context follows: `domain/` (model, service, exception, util) → `application/` (workflow, policies) → `infrastructure/` (controller, config, adapter, repository).

## Key Technical Decisions

- **Reactive stack**: WebFlux + R2DBC (no blocking, no JPA)
- **Signing SPI**: `SigningProvider` interface with runtime provider selection via `DelegatingSigningProvider`
- **Credential format**: Currently only `jwt_vc_json` (W3C VCDM v2.0)
- **Grant type**: Currently only `pre-authorized_code` (+ `refresh_token`)
- **Authentication**: Unified filter chain — all endpoints via `CustomAuthenticationManager` (Verifier tokens + internal tokens)
- **Credential definitions**: Hardcoded in Java Factory classes (LEARCredentialEmployee, LEARCredentialMachine, LabelCredential)

## Documentation

Cross-cutting protocol docs in `.claude/shared/docs/protocols/`.

## Reference: fikua-lab

The reference implementation (fikua-lab) lives at `/Users/ocanades/Projects/fikua/fikua-lab`.
Its technical document is at `docs/fikua-lab-dt.md`. Key differences from this repo:

- fikua-lab uses Javalin + JDBC (synchronous), this repo uses Spring WebFlux + R2DBC (reactive)
- fikua-lab has `fikua-core` as a pure protocol library with zero dependencies
- fikua-lab supports both `dc+sd-jwt` and `mso_mdoc`, this repo only supports `jwt_vc_json`
- fikua-lab implements full HAIP profile (DPoP, PAR, PKCE, WIA), this repo does not

## Local Development

### Setup (one time)

```bash
cd docker && cp .env.example .env   # add RESEND_API_KEY
```

### Option 1: IDE + Docker (fastest iteration)

```bash
cd docker && docker compose up -d postgres   # DB only
# Backend from IDE: SPRING_PROFILES_ACTIVE=local, RESEND_API_KEY=re_...
# Angular frontend:
cd ../in2-eudistack-issuer-core-ui && make deploy-local
```

### Option 2: Full Docker stack

```bash
cd docker
docker compose up -d                   # DB + backend
docker compose up -d --build backend   # rebuild after code changes
# Angular frontend:
cd ../in2-eudistack-issuer-core-ui && make deploy-local
```

### Option 3: Build only

```bash
./gradlew build          # Build + tests
./gradlew test           # 161 test files, 1.56:1 test-to-code ratio
./gradlew bootRun        # Run (needs PostgreSQL + env vars)
```

### Services

| Service | URL | Purpose |
|---------|-----|---------|
| Backend | http://localhost:8080 | Issuer API |
| Frontend | http://localhost:4200 | Angular Issuer Portal |
| PostgreSQL | localhost:5432 | Database (issuer/issuer/issuer) |
| Swagger UI | http://localhost:8080/springdoc/swagger-ui.html | API docs |

### Angular Makefile (in2-eudistack-issuer-core-ui)

```bash
make deploy-local    # Start backend infra + ng serve --open
make backend-up      # Only start Docker infra
make backend-down    # Stop Docker infra
make backend-rebuild # Rebuild backend container
make backend-logs    # Tail backend logs
make backend-db-reset # Reset DB (drop volume)
make build           # Production build
make test            # Jest tests
make lint            # ESLint
```

## Critical Paths (do not break)

1. Pre-authorized_code flow: Credential Offer → Token (pre-auth + tx_code) → Credential
2. W3C VCDM v2.0 `jwt_vc_json` format for LEARCredentialEmployee/Machine/Label
3. Signing SPI: InMemory (dev) / CscSignHash (production)
4. Status List revocation
5. Deferred credential flow
