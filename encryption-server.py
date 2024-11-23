# encryption-server.py
import subprocess
from flask import Flask, request, jsonify
from flask_cors import CORS
from phe import paillier
import os
import json
import time 
from diffprivlib.mechanisms import LaplaceBoundedDomain

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
BASE_DIR = os.path.abspath(os.getcwd())  

# Generate Paillier public and private key pair
public_key, private_key = paillier.generate_paillier_keypair()

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
        start_time = time.time()  
        encrypted_value = public_key.encrypt(value)
        end_time = time.time()  

        encryption_time = (end_time - start_time) * 1000  

        return jsonify({
            'ciphertext': str(encrypted_value.ciphertext()),
            'exponent': encrypted_value.exponent,
            'encryption_time_ms': encryption_time 
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

        if abs(noisy_sum) > 1e6:
            noisy_sum = f"{noisy_sum:.2e}" 

        return jsonify({
            'encrypted_result': str(encrypted_sum.ciphertext()),
            'decrypted_result': decrypted_sum,
            'noisy_result': noisy_sum
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/aggregate_with_dp', methods=['POST'])
def aggregate_with_dp():
    """
    Aggregate encrypted values, apply differential privacy, and evaluate noise-accuracy trade-off for various epsilon values.
    """
    try:
        data = request.get_json()
        encrypted_values = data['encrypted_values']
        epsilon_values = data.get('epsilon_values', [0.5, 1.0, 2.0])  # Default epsilon values to test

        encrypted_numbers = [
            paillier.EncryptedNumber(public_key, int(val['ciphertext']), val['exponent'])
            for val in encrypted_values
        ]
        encrypted_sum = sum(encrypted_numbers)
        decrypted_sum = private_key.decrypt(encrypted_sum)

        # Calculate noisy results for each epsilon and evaluate noise impact
        results = []
        for epsilon in epsilon_values:
            mech = LaplaceBoundedDomain(
                epsilon=epsilon,
                sensitivity=1,
                lower=-1e6,
                upper=1e6
            )
            noisy_result = mech.randomise(decrypted_sum)
            noise_diff = abs(decrypted_sum - noisy_result) / decrypted_sum * 100  # Percentage difference
            results.append({
                'epsilon': epsilon,
                'noisy_result': noisy_result,
                'original_result': decrypted_sum,
                'noise_diff_percent': noise_diff
            })

        return jsonify({
            'aggregated_result': decrypted_sum,
            'dp_results': results
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

        # Witness generation, proof creation, and verification
        commands = [
            f'node {os.path.join(BASE_DIR, "zkp_circuit_js/generate_witness.js")} {os.path.join(BASE_DIR, "zkp_circuit_js/zkp_circuit.wasm")} {input_json_path} {os.path.join(BASE_DIR, "witness.wtns")}',
            f'snarkjs groth16 prove {os.path.join(BASE_DIR, "zkp_circuit_final.zkey")} {os.path.join(BASE_DIR, "witness.wtns")} {os.path.join(BASE_DIR, "proof.json")} {os.path.join(BASE_DIR, "public.json")}',
            f'snarkjs groth16 verify {os.path.join(BASE_DIR, "verification_key.json")} {os.path.join(BASE_DIR, "public.json")} {os.path.join(BASE_DIR, "proof.json")}'
        ]

        start_proof = time.time()
        result_proof = subprocess.run(commands[0], shell=True, capture_output=True, text=True)
        if result_proof.returncode != 0:
            return jsonify({'error': f"Proof generation failed: {commands[0]}", 'details': result_proof.stderr}), 400
        end_proof = time.time()

        start_create = time.time()
        result_create = subprocess.run(commands[1], shell=True, capture_output=True, text=True)
        if result_create.returncode != 0:
            return jsonify({'error': f"Proof creation failed: {commands[1]}", 'details': result_create.stderr}), 400
        end_create = time.time()

        start_verify = time.time()
        result_verify = subprocess.run(commands[2], shell=True, capture_output=True, text=True)
        if result_verify.returncode != 0:
            return jsonify({'error': f"Verification failed: {commands[2]}", 'details': result_verify.stderr}), 400
        end_verify = time.time()

        # Calculate time metrics
        proof_generation_time = end_proof - start_proof
        proof_creation_time = end_create - start_create
        verification_time = end_verify - start_verify

        return jsonify({
            'verified': "OK" in result_verify.stdout.strip(),
            'proof_generation_time_s': proof_generation_time,
            'proof_creation_time_s': proof_creation_time,
            'verification_time_s': verification_time
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)
