SGX_SDK ?= /path/to/sgx-sdk
SGX_MODE ?= HW
SGX_ARCH ?= x64

Enclave_Name := Enclave
Enclave_Objects := enclave.o

all: $(Enclave_Name).signed.so

$(Enclave_Name).so: $(Enclave_Objects)
    $(SGX_SDK)/bin/x64/sgx_edger8r --trusted enclave.edl --search-path $(SGX_SDK)/include
    gcc -shared -o $@ $^ -L$(SGX_SDK)/lib64 -lsgx_trts

$(Enclave_Name).signed.so: $(Enclave_Name).so
    $(SGX_SDK)/bin/x64/sgx_sign sign -enclave $(Enclave_Name).so -key enclave_private.pem -out $@
