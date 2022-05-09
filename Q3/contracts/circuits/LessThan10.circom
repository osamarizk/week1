pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";



template LessThan10(n) {
    signal input in;
    signal output out;

    component lt = LessThan(n); 

    lt.in[0] <== in;
    lt.in[1] <== 10;

    out <== lt.out;
}
component main= LessThan10(32);
