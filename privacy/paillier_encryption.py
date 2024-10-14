from phe import paillier

# Generate Paillier keys
def generate_keys():
    return paillier.generate_paillier_keypair()

# Encrypt data using the public key
def encrypt_data(public_key, data):
    return public_key.encrypt(data)

# Decrypt aggregated data using the private key
def decrypt_data(private_key, encrypted_data):
    return private_key.decrypt(encrypted_data)
