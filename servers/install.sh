#!/bin/bash

set -e

cd "$(dirname "$0")"

echo "Carregando .env..."

set -a
source .env
set +a

mkdir -p generated

envsubst < templates/livekit.yaml.template > generated/livekit.yaml
envsubst < templates/turnserver.conf.template > generated/turnserver.conf

docker compose pull

docker compose up -d