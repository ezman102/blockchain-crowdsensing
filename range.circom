pragma circom 2.0.0;

template RangeCheck(rangeMin, rangeMax) {
    signal input x;   // The value to check
    signal output valid; // 1 if within range, 0 otherwise

    // Range constraints
    valid <== (x >= rangeMin) && (x <= rangeMax);
}

component main = RangeCheck(0, 50);
