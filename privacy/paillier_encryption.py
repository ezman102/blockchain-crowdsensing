from phe import paillier
import sys

# Generate Paillier keys (normally, these would be pre-generated and securely stored)
public_key, private_key = paillier.generate_paillier_keypair()

# Retrieve the plaintext data from command-line argument
plaintext_data = int(sys.argv[1])

# Encrypt the data
encrypted_data = public_key.encrypt(plaintext_data)

# Output the encrypted data (to be captured by Node.js script)
print(encrypted_data.ciphertext())
