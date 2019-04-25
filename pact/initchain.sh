#!/usr/bin/env bash

pact -a yamls/initialization.yaml | curl -d @- http://localhost:8081/api/v1/send
echo
