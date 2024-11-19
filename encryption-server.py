# encryption-server.py
import subprocess
from flask import Flask, request, jsonify
from flask_cors import CORS
from phe import paillier
import os
import json
from diffprivlib.mechanisms import LaplaceBoundedDomain

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
BASE_DIR = os.path.abspath(os.getcwd())  # Get the absolute path of the current directory

@app.before_request
def handle_options_requests():
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response

# Generate Paillier public and private key pair
public_key, private_key = paillier.generate_paillier_keypair()

# Differential privacy mechanism setup
epsilon = 1.0  
sensitivity = 1  

from diffprivlib.mechanisms import LaplaceBoundedDomain

def add_noise_to_sum(aggregated_sum):
    """Add Laplace noise with bounded range to the aggregated sum."""
    mech = LaplaceBoundedDomain(
        epsilon=1.0, 
        sensitivity=1, 
        lower=-1e6,  
        upper=1e6    
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

        encrypted_numbers = [
            paillier.EncryptedNumber(public_key, int(val['ciphertext']), val['exponent'])
            for val in encrypted_values
        ]

        encrypted_sum = sum(encrypted_numbers)

        decrypted_sum = private_key.decrypt(encrypted_sum)

        noisy_sum = add_noise_to_sum(decrypted_sum)

        # Handle large results properly and return them safely
        if abs(noisy_sum) > 1e6:
            noisy_sum = f"{noisy_sum:.2e}" 

        return jsonify({
            'encrypted_result': str(encrypted_sum.ciphertext()),
            'decrypted_result': decrypted_sum,
            'noisy_result': noisy_sum
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/zkp_verify', methods=['POST'])
def zkp_verify():
    try:
        # Get the value and prepare input.json
        value = request.get_json()['value']
        input_json_path = os.path.join(BASE_DIR, "input.json")
        with open(input_json_path, "w") as f:
            json.dump({"data": value}, f)

        # Commands for witness generation, proof creation, and verification
        commands = [
            f'node {os.path.join(BASE_DIR, "zkp_circuit_js/generate_witness.js")} {os.path.join(BASE_DIR, "zkp_circuit_js/zkp_circuit.wasm")} {input_json_path} {os.path.join(BASE_DIR, "witness.wtns")}',
            f'snarkjs groth16 prove {os.path.join(BASE_DIR, "zkp_circuit_final.zkey")} {os.path.join(BASE_DIR, "witness.wtns")} {os.path.join(BASE_DIR, "proof.json")} {os.path.join(BASE_DIR, "public.json")}',
            f'snarkjs groth16 verify {os.path.join(BASE_DIR, "verification_key.json")} {os.path.join(BASE_DIR, "public.json")} {os.path.join(BASE_DIR, "proof.json")}'
        ]

        # Run commands sequentially
        for cmd in commands:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            if result.returncode != 0:
                return jsonify({'error': f"Command failed: {cmd}", 'details': result.stderr}), 400

        return jsonify({'verified': "OK" in result.stdout.strip()})
    except Exception as e:
        return jsonify({'error': str(e)}), 500



if __name__ == '__main__':
    app.run(port=5000)
