from flask import Flask, request, jsonify
from flask_cors import CORS
from phe import paillier
from diffprivlib.mechanisms import LaplaceBoundedDomain

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:8000"}})

# Generate Paillier public and private key pair
public_key, private_key = paillier.generate_paillier_keypair()

# Differential privacy mechanism setup
epsilon = 1.0  # Privacy budget
sensitivity = 1  # Data sensitivity for Laplace mechanism

from diffprivlib.mechanisms import LaplaceBoundedDomain

def add_noise_to_sum(aggregated_sum):
    """Add Laplace noise with bounded range to the aggregated sum."""
    mech = LaplaceBoundedDomain(
        epsilon=1.0, 
        sensitivity=1, 
        lower=-1e6,  # Lower bound
        upper=1e6    # Upper bound
    )
    noisy_sum = mech.randomise(aggregated_sum)
    return noisy_sum


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

        # Aggregate encrypted values
        encrypted_sum = sum(encrypted_numbers)

        # Decrypt the aggregated sum
        decrypted_sum = private_key.decrypt(encrypted_sum)

        # Add noise to the decrypted sum with bounded noise
        noisy_sum = add_noise_to_sum(decrypted_sum)

        # Handle large results properly and return them safely
        if abs(noisy_sum) > 1e6:
            noisy_sum = f"{noisy_sum:.2e}"  # Format to scientific notation

        return jsonify({
            'encrypted_result': str(encrypted_sum.ciphertext()),
            'decrypted_result': decrypted_sum,
            'noisy_result': noisy_sum
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(port=5000)
