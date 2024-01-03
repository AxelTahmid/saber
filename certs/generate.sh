#!/bin/bash

GREEN='\033[0;32m'

echo -e "${GREEN}********************************"
echo -e "*                              *"
echo -e "*      GENERATE JWT KEY        *"
echo -e "*                              *"
echo -e "********************************${NC}"
echo ""

export openssl_minversion=1.1.1
if echo -e "$(openssl version|awk '{print $2}')\n${openssl_minversion}" | sort -V | head -1 | grep -q ^${openssl_minversion}$;then
  echo "openssl - okay"
  echo "generating P-256 ECDSA key pair"
else
  echo "openssl not found or supported"
fi

openssl ecparam -genkey -name prime256v1 -noout -out private.pem

openssl ec -in private.pem -pubout -out public.pem

