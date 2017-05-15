#!/bin/sh

npm install -y -d --save-dev \
    express \
    webpack \
    webpack-dev-middleware \
    webpack-hot-middleware \
    less \
    less-loader \
    css-loader \
    style-loader \
    file-loader \
    url-loader \
    jshint \
    jshint-loader \
    extract-text-webpack-plugin

npm install -y -d --save \
    libcore \
    libdom \
    libdom-http
