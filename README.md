Crowdsensing Blockchain DApp 
Overview

This project is a blockchain-based decentralized application (DApp) designed for secure crowdsensing with data aggregation, encryption, and differential privacy features. The application leverages Ethereum smart contracts, Paillier encryption, differential privacy, and SGX (future improvement) for data security and trust.

Prerequisites

    Node.js: Install from Node.js Official Website.
    Truffle: Install globally using npm install -g truffle.
    Ganache: Install Ganache for a local Ethereum blockchain.
    Python 3.8+: Required for the backend server.
    Flask: Install with pip install flask flask-cors phe diffprivlib.
    MetaMask: Install the MetaMask browser extension from MetaMask Official Website.

Setup and Running Instructions

Step 1: Smart Contract Deployment

    Start Ganache on your local machine.
    In the project root directory, compile and deploy the contracts:

    truffle migrate --reset

    After deploying the smart contract, update the contract address in app.js.

Step 2: Backend Encryption Server

    Navigate to the project directory and start the encryption server:

    python encryption-server.py

Step 3: Frontend DApp

    Serve the frontend using a local HTTP server:

    python -m http.server 8000

    Open your browser and navigate to http://localhost:8000.

Step 4: MetaMask Integration

    Ensure the MetaMask extension is installed in your browser.

    Connect MetaMask to your Ganache local blockchain network.

    Import an account from Ganache by using the private key of one of the accounts provided in Ganache.


Future Improvements

    SGX Integration: Secure computation within Intel SGX enclaves.

    Enhanced ZKP: Advanced zero-knowledge proof circuits for added data security.

    Deployment: Deployment to a public Ethereum testnet or mainnet.

Github:https://github.com/ezman102/blockchain-crowdsensing