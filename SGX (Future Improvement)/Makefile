ENCLAVE_NAME := enclave
TRUSTED_SRC := enclave.cpp
UNTRUSTED_SRC := enclave_untrusted.cpp

SGX_SDK := /opt/intel/sgxsdk
SGX_COMMON_FLAGS := -m64 -O2 -nostdinc -fvisibility=hidden -fpie
SGX_ENCLAVE_FLAGS := -nostdlib -nodefaultlibs -nostartfiles -L$(SGX_SDK)/lib64 -Wl,--no-undefined -Wl,-Bstatic -Wl,-Bsymbolic -Wl,--export-dynamic

# Enclave binary
$(ENCLAVE_NAME).so: $(TRUSTED_SRC)
	$(CXX) $(SGX_COMMON_FLAGS) $(SGX_ENCLAVE_FLAGS) -o $@ $< -L$(SGX_SDK)/lib64 -lsgx_trts -lsgx_tstdc

# Untrusted binary
untrusted: $(UNTRUSTED_SRC)
	$(CXX) -o untrusted $< -L$(SGX_SDK)/lib64 -lsgx_urts -lsgx_uprotected_fs
