#!/bin/bash
set -e

echo "Pull latest code..."
git pull origin main

echo "Rebuild & restart..."
docker compose down
docker compose up -d --build

echo "Cleaning old images..."
docker image prune -f

echo "Deploy complete!"