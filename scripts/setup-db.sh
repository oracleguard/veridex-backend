#!/bin/bash
echo "Setting up database..."
npm run db:migrate
npm run db:seed
