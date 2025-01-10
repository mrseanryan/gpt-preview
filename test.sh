set -e

npx tsx ./src/main_cli.ts ./test-data/plain-text-functions.json -f=DOT "$@"

npx tsx ./src/main_cli.ts ./test-data/plain-text-functions.txt -f=JSON "$@"
