#include <iostream>
#include <sgx_urts.h>
#include "Enclave_u.h"  // Untrusted header generated from enclave.edl

#define ENCLAVE_FILE "enclave.signed.so"

// OCALL to log messages from the enclave
void ocall_print(const char *message) {
    std::cout << "Enclave says: " << message << "\n";
}

int main() {
    sgx_enclave_id_t eid;        // Enclave ID
    sgx_status_t sgx_status;     // SGX SDK function status

    // Initialize the SGX enclave
    sgx_status = sgx_create_enclave(ENCLAVE_FILE, SGX_DEBUG_FLAG, nullptr, nullptr, &eid, nullptr);
    if (sgx_status != SGX_SUCCESS) {
        std::cerr << "Failed to create enclave. Error code: " << sgx_status << "\n";
        return -1;
    }

    std::cout << "Enclave created successfully.\n";

    // Call a trusted function in the enclave
    sgx_status = hello_world(eid);
    if (sgx_status != SGX_SUCCESS) {
        std::cerr << "Failed to execute trusted function. Error code: " << sgx_status << "\n";
    } else {
        std::cout << "Successfully executed hello_world in the enclave.\n";
    }

    // Destroy the enclave
    sgx_destroy_enclave(eid);
    std::cout << "Enclave destroyed successfully.\n";

    return 0;
}
