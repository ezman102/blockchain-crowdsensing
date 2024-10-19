from phe import paillier
import sys
import json

# Generate Paillier public and private key pair
public_key, private_key = paillier.generate_paillier_keypair()

def encrypt_data(value):
    """Encrypts the given value using the public key."""
    encrypted_value = public_key.encrypt(value)
    return encrypted_value.ciphertext()

def decrypt_data(ciphertext):
    """Decrypts the given ciphertext using the private key."""
    encrypted_value = paillier.EncryptedNumber(public_key, int(ciphertext))
    return private_key.decrypt(encrypted_value)

def main():
    # Encrypt the data provided via command-line argument
    if len(sys.argv) < 2:
        print("Usage: python paillier_encryption.py <value>")
        sys.exit(1)

    value = int(sys.argv[1])
    encrypted_value = encrypt_data(value)
    print(json.dumps({"encrypted": encrypted_value}))

if __name__ == "__main__":
    main()
