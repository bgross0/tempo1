#!/bin/bash
NODE_OPTIONS='--experimental-vm-modules' npx jest --config tests/config/jest.config.js "$@"