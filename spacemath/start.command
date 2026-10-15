#!/bin/sh
cd "$(dirname "$0")" || exit 1
open http://localhost:8051/
exec python3 -m http.server 8051 --bind 127.0.0.1
