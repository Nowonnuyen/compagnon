#!/bin/bash

# Charge nvm (Node Version Manager)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Utilise la version de node définie dans .nvmrc (ici Node 18)
nvm use

# Lance ton app Node
node app.js

