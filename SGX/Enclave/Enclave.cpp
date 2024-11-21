#include "Enclave_t.h"  // Trusted header generated from enclave.edl

void hello_world() {
    ocall_print("Hello, World from the enclave!");
}
