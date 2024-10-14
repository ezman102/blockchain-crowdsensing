from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP
from Crypto.Random import get_random_bytes

class HomomorphicEncryption:
    def __init__(self):
        self.key = RSA.generate(2048)
        self.public_key = self.key.publickey()
        self.cipher = PKCS1_OAEP.new(self.public_key)

    def encrypt(self, data):
        encrypted_data = self.cipher.encrypt(data.encode('utf-8'))
        return encrypted_data

    def decrypt(self, encrypted_data):
        cipher = PKCS1_OAEP.new(self.key)
        decrypted_data = cipher.decrypt(encrypted_data)
        return decrypted_data.decode('utf-8')
