const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16, plonk } = require("snarkjs");

function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o===null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

describe("HelloWorld", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing

        //create the proof and calculate the witness in the same command
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");
        
        //when the proof is generated, all the public values ​​of this circom, that is, publicSignals , =2
        console.log('1x2 =',publicSignals[0]);
        
        // edit public signals =[ 2n ]
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        // edit generated proof of a computational process
        const editedProof = unstringifyBigInts(proof);
        // store proof(secret) and public signals on calldata variables
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
        
        //map proof(secret) and public signals to compare with input
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
        // get a(input)value from proof
        const a = [argv[0], argv[1]];
        // get b(input)value from proof
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        // get c(input)value from proof
        const c = [argv[6], argv[7]];
        // get (input)value from proof
        const Input = argv.slice(8);
        
        // verification , bool true if proof is valid
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {
    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        //create the proof and calculate the witness in the same command
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2","c":"3"}, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3/circuit_final.zkey");
        
        //when the proof is generated, all the public values ​​of this circom, that is, publicSignals , =6
        console.log('1x2X3 =',publicSignals[0]);
        
        // edit public signals =[ 2n ]
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        // edit generated proof of a computational process
        const editedProof = unstringifyBigInts(proof);
        // store proof(secret) and public signals on calldata variables
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
        
        //map proof(secret) and public signals to compare with input
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
        // get a(input)value from proof
        const a = [argv[0], argv[1]];
        // get b(input)value from proof
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        // get c(input)value from proof
        const c = [argv[6], argv[7]];
        // get (input)value from proof
        const Input = argv.slice(8);
        
        // verification , bool true if proof is valid
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with PLONK", function () {

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("PlonkVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
         
         var text = fs.readFileSync("./contracts/circuits/_plonk/build/multiplier3/call.txt", 'utf-8');
         var calldata = text.split(',');
         //console.log(calldata);
         expect(await verifier.verifyProof(calldata[0], JSON.parse(calldata[1]))).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = '0x00';
        let b = ['0'];
        expect(await verifier.verifyProof(a, b)).to.be.false;
    });
});