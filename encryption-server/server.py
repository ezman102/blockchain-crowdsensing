from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS from flask_cors
from phe import paillier

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Generate Paillier key pair for encryption
public_key, private_key = paillier.generate_paillier_keypair()

@app.route('/encrypt', methods=['GET'])
def encrypt():
    try:
        # Ensure value is a valid integer
        value = int(request.args.get('value'))
        
        # Encrypt the value using Paillier encryption
        encrypted_value = public_key.encrypt(value)
        
        # Return the encrypted value as a string
        return jsonify({'encrypted': str(encrypted_value.ciphertext())})
    except ValueError:
        return jsonify({'error': 'Invalid input. Please provide a numeric value.'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)
