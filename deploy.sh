#!/bin/bash

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_step() {
    echo -e "${YELLOW}▶ $1${NC}"
}

log_success() {
    echo -e "${GREEN}✔ $1${NC}"
}

log_error() {
    echo -e "${RED}✘ $1${NC}"
}

cleanup() {
    log_error "Deployment failed! Rolling back maintenance mode..."
    php artisan up 2>/dev/null || true
}

trap cleanup EXIT

log_step "Entering maintenance mode..."
php artisan down

log_step "Pulling latest changes from repository..."
git pull origin main

log_step "Installing composer dependencies (no-dev)..."
composer install --no-dev --optimize-autoloader

log_step "Running database migrations..."
php artisan migrate --force

log_step "Caching configuration..."
php artisan config:cache

log_step "Caching routes..."
php artisan route:cache

log_step "Caching views..."
php artisan view:cache

log_step "Creating storage symlink..."
php artisan storage:link

log_step "Restarting queue workers..."
php artisan queue:restart

log_step "Exiting maintenance mode..."
php artisan up

trap - EXIT

log_success "Deployment completed successfully!"
