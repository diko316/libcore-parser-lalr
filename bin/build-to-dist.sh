#!/bin/sh

ROOT=$(dirname $(dirname $(readlink -f $0)))
CURRENT_DIR=$(pwd)
TARGET=${ROOT}/dist
TARGET_GID=$(stat -c '%g' ${TARGET})
TARGET_UID=$(stat -c '%u' ${TARGET})

cd "${ROOT}"
echo "currently in ${ROOT} directory"

if npm run test; then
    
    echo "Proceed to build."
    
    npm run build
    npm run build-optimized
    
    if cp -R ${ROOT}/test/assets/* ${ROOT}/dist/; then
        chown $(stat -c '%u:%g' ${ROOT}/dist) -R ${ROOT}/dist/*
        echo "Built all sources to output directory."
        
    else
        echo "No builds as for now."
        
    fi
    
    exit 0

else
    echo "Unable to build."
    exit 1
fi
