#!/usr/bin/env bash
m4 -P core/base.m4 core/compiler.m4
cp -r ./assets/* ../dist/
