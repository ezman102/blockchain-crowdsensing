// #include "enclave_t.h"  
// #include <string.h>
// #include <math.h>

// // Dummy decryption function 
// void decrypt_and_aggregate(uint8_t* encrypted_data, size_t size, uint8_t* result, size_t result_size) {
//     if (size == 0 || result_size == 0) {
//         ocall_print_string("Invalid input sizes for decryption.");
//         return;
//     }

//     // Simulate decryption and aggregation
//     int sum = 0;
//     for (size_t i = 0; i < size; i++) {
//         sum += encrypted_data[i];  
//     }

//     if (result_size >= sizeof(int)) {
//         memcpy(result, &sum, sizeof(int));
//     } else {
//         ocall_print_string("Result buffer is too small.");
//     }
// }

// // Simulate differential privacy noise
// void add_noise(double aggregate, double epsilon, double* noisy_result) {
//     if (epsilon <= 0) {
//         ocall_print_string("Epsilon must be greater than 0.");
//         *noisy_result = aggregate;  
//         return;
//     }

//     double sensitivity = 1.0;
//     double scale = sensitivity / epsilon;
//     double noise = (rand() / (double)RAND_MAX - 0.5) * 2.0 * scale;  

//     *noisy_result = aggregate + noise;
// }
