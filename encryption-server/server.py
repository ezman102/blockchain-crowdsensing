from flask import Flask, request, jsonify
from flask_cors import CORS
from phe import paillier

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:8000"}})

# Generate Paillier key pair for encryption
public_key, private_key = paillier.generate_paillier_keypair()

@app.route('/encrypt', methods=['GET'])
def encrypt():
    try:
        value = int(request.args.get('value'))
        encrypted_value = public_key.encrypt(value)
        return jsonify({
            'ciphertext': str(encrypted_value.ciphertext()),
            'exponent': encrypted_value.exponent
        })
    except ValueError:
        return jsonify({'error': 'Invalid input. Provide a numeric value.'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/aggregate', methods=['POST'])
def aggregate():
    try:
        data = request.get_json()
        if 'encrypted_values' not in data:
            return jsonify({'error': "'encrypted_values' key missing in request"}), 400

        encrypted_values = data['encrypted_values']

        # Reconstruct EncryptedNumber objects from the received data
        aggregated_encrypted = None
        for val in encrypted_values:
            encrypted_number = paillier.EncryptedNumber(
                public_key, 
                int(val['ciphertext']), 
                int(val['exponent'])
            )
            if aggregated_encrypted is None:
                aggregated_encrypted = encrypted_number
            else:
                aggregated_encrypted += encrypted_number

        # Optionally decrypt the aggregated result for testing
        decrypted_sum = private_key.decrypt(aggregated_encrypted)
        print(f"Decrypted Aggregated Sum: {decrypted_sum}")

        return jsonify({'result': str(aggregated_encrypted.ciphertext())})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)
