from flask import Flask, request, jsonify
from flask_cors import CORS
from phe import paillier

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:8000"}})

# Generate Paillier public and private key pair
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
        encrypted_values = data['encrypted_values']

        # Convert to EncryptedNumber objects
        encrypted_numbers = [
            paillier.EncryptedNumber(public_key, int(val['ciphertext']), val['exponent'])
            for val in encrypted_values
        ]

        # Aggregate the encrypted values (Sum)
        encrypted_sum = sum(encrypted_numbers)

        # Decrypt the aggregated sum
        decrypted_sum = private_key.decrypt(encrypted_sum)

        return jsonify({
            'encrypted_result': str(encrypted_sum.ciphertext()),
            'decrypted_result': decrypted_sum
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)
