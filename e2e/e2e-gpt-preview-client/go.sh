set -e

npm add gpt-preview@latest 
ls -al node_modules/gpt-preview

echo "Executing the e2e test client..."
npx tsx ./src/index.ts
