#!/bin/bash

GRAY='\033[1;36m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GRAY}*************************************************"
echo -e "*                                               *"
echo -e "*        AREKTACOINSTORE DATABASE SCRIPT        *"
echo -e "*                                               *"
echo -e "*************************************************${NC}"
echo ""
sleep 1

echo -e "${GREEN}*************************************************"
echo -e "*  Rolling Back Migrations if Exists           *"
echo -e "*************************************************${NC}"
npx knex migrate:rollback --all --debug

echo -e "${GREEN}*************************************************"
echo -e "*  Migrating Tables                            *"
echo -e "*************************************************${NC}"
npx knex migrate:latest --debug

echo -e "${GREEN}*************************************************"
echo -e "*  Seeding Tables                              *"
echo -e "*************************************************${NC}"
npx knex seed:run --debug


# npm config set script-shell "C:\\Program Files\\git\\bin\\bash.exe"
# reverse it npm config delete script-shell
# https://stackoverflow.com/questions/23243353/how-to-set-shell-for-npm-run-scripts-in-windows