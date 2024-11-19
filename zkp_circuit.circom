pragma circom 2.0.0;

template NonZeroProof() {
    signal input data;          // Input data (e.g., CO₂ emissions in grams)
    signal output isValid;      // Output: 1 if valid (non-zero), 0 otherwise
    signal inv;                 // Auxiliary signal for validation

    // Check if data is non-zero using auxiliary inversion
    inv <-- data != 0 ? 1 / data : 0;
    isValid <== data * inv;     // isValid will be 1 if data is non-zero, otherwise 0
}

component main {public [data]} = NonZeroProof();
