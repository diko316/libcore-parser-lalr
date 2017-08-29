#!/bin/sh

TOOLS=$(dirname $(readlink -f $0))

${TOOLS}/build-bundle.sh sync-demo
