#!/bin/bash

set -e

cd "$(dirname "$0")"

echo "Carregando configurações..."

set -a
source .env
set +a

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backup/$TIMESTAMP"

mkdir -p "$BACKUP_DIR"

echo "Realizando backup do banco de dados..."

docker compose exec -T mysql \
    mysqldump \
    -uroot \
    -p"$MYSQL_ROOT_PASSWORD" \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    "$MYSQL_DATABASE" \
    > "$BACKUP_DIR/$MYSQL_DATABASE.sql"

echo ""
echo "========================================"
echo " Backup concluído com sucesso!"
echo " Local: $BACKUP_DIR/$MYSQL_DATABASE.sql"
echo "========================================"