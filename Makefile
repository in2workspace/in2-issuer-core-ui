# ---------------------------------------------------------------------------
# Makefile - Issuer Core UI (Angular)
#
# Prerequisite: cd ../altia-eudistack-issuer-core-backend/docker
#               docker compose up -d postgres   (or full stack)
# ---------------------------------------------------------------------------

# Backend repo location (relative to this Makefile)
BACKEND_DIR := ../altia-eudistack-issuer-core-backend

.PHONY: help install deploy-local stop-local backend-up backend-down \
        build test lint clean

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

# ---------- Local development -----------------------------------------------

install: ## Install npm dependencies
	npm install

deploy-local: install backend-up ## Start backend infra + Angular dev server
	@echo "--------------------------------------------"
	@echo " Backend:   http://localhost:8080"
	@echo " Frontend:  http://localhost:4200"
	@echo " Swagger:   http://localhost:8080/springdoc/swagger-ui.html"
	@echo "--------------------------------------------"
	npx ng serve --open

stop-local: ## Stop Angular dev server hint + backend infra
	@echo "Press Ctrl+C to stop ng serve, then run: make backend-down"

# ---------- Backend Docker infra --------------------------------------------

backend-up: ## Start PostgreSQL + backend containers
	@cd $(BACKEND_DIR)/docker && \
		test -f .env || (echo "ERROR: $(BACKEND_DIR)/docker/.env not found. Copy .env.example to .env" && exit 1) && \
		docker compose up -d

backend-down: ## Stop backend containers
	@cd $(BACKEND_DIR)/docker && docker compose down

backend-rebuild: ## Rebuild and restart backend container
	@cd $(BACKEND_DIR)/docker && docker compose up -d --build backend

backend-logs: ## Tail backend container logs
	@cd $(BACKEND_DIR)/docker && docker compose logs -f backend

backend-db-reset: ## Drop and recreate the database volume
	@cd $(BACKEND_DIR)/docker && docker compose down -v && docker compose up -d postgres
	@echo "Postgres restarted with clean volume. Run 'make backend-up' to start backend."

# ---------- Angular build & quality -----------------------------------------

build: install ## Production build
	npx ng build --configuration production

test: ## Run unit tests (Jest)
	npm test

lint: ## Run ESLint
	npx ng lint

clean: ## Remove build artifacts and node_modules
	rm -rf dist node_modules .angular
