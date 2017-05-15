#!/bin/sh

ROOT=$(dirname $(dirname $(readlink -f $0)))
CURRENT_DIR=$(pwd)

auto-sync

cd "${ROOT}"
npm run start
cd "${CURRENT_DIR}"
