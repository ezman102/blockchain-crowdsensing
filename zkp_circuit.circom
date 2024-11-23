pragma circom 2.0.0;

template NonZeroProof() {
    signal input data;          // Input data (CO₂ emissions in grams)
    signal output isValid;      // Output: Make it simple, 1 if valid (non-zero), 0 otherwise
    signal inv;                 // Auxiliary signal for validation

    // Check if data is non-zero using auxiliary inversion
    inv <-- data != 0 ? 1 / data : 0;
    isValid <== data * inv;     
}

component main {public [data]} = NonZeroProof();
