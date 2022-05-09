#!/bin/bash

cd contracts/circuits/_plonk
mkdir -p build

mkdir -p build/multiplier3

# generate witness
node "multiplier3_js/generate_witness.js" multiplier3_js/multiplier3.wasm input.json build/multiplier3/witness.wtns
        
# # generate proof
snarkjs plonk prove circuit_0001.zkey build/multiplier3/witness.wtns build/multiplier3/proof.json build/multiplier3/public.json

# # verify proof
snarkjs plonk verify verification_key.json build/multiplier3/public.json build/multiplier3/proof.json

# # generate call
snarkjs zkey export soliditycalldata build/multiplier3/public.json build/multiplier3/proof.json > build/multiplier3/call.txt