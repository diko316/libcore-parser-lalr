#!/bin/sh

TOOLS=$(dirname $(readlink -f $0))

auto-sync

${APP_TOOLS}/watcher/watch.sh "${PROJECT_ROOT}/src" "${TOOLS}/build-to-dist.sh"
