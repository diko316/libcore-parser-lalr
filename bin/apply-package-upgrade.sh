#!/bin/sh

if [ ! ${SOURCE_MOD_PATH} ]; then
    echo "MOD path not set." 1>&2
    exit 1
fi


if [ ! -d ${SOURCE_MOD_PATH} ] || [ ! -w ${SOURCE_MOD_PATH} ]; then
    echo "MOD path not a directory or not writable." 1>&2
    exit 2
fi

if [ ! ${PROJECT_ROOT} ]; then
    PROJECT_ROOT=$(dirname $(dirname $(readlink -f $0)))
fi

echo "root: ${PROJECT_ROOT}"
rm -Rf ${PROJECT_ROOT}/node_modules
cd ${PROJECT_ROOT}

PACKAGES=$(node -e 'var f=require("./package.json"),p=f.devDependencies||{};for(var n in p){ console.log(n);}' | \
                tr '\n' ' ' | \
                sed 's/ $//g')

if ! "npm install -y -dd --save-dev ${PACKAGES}"; then
    echo "Unable to continue installing other packages." 1>&2
    exit 3
fi
             

PACKAGES=$(node -e 'var f=require("./package.json"),p=f.dependencies||{};for(var n in p){ console.log(n);}' | \
                tr '\n' ' ' | \
                sed 's/ $//g')


if ! "npm install -y -dd --save ${PACKAGES}"; then
    echo "Unable to continue creating package.json file." 1>&2
    exit 4
fi



## copy updated package.json
if ! cp -f ./package.json "${SOURCE_MOD_PATH}/package.json"; then
    echo "Unable to sync package.json to ${SOURCE_MOD_PATH}." 1>&2
    exit 5
fi

echo "Sync complete"
exit 0

