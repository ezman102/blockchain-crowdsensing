//app.js
let web3;
let contract;
let accounts;
let encryptedValues = []; 

window.addEventListener('load', async () => {
    if (window.ethereum) {
        try {
            // Initialize Web3 with MetaMask's provider
            web3 = new Web3(window.ethereum);
            await ethereum.request({ method: 'eth_requestAccounts' });
            accounts = await web3.eth.getAccounts();

            document.getElementById('account').innerText = accounts[0];
            console.log("Connected account:", accounts[0]);

            const response = await fetch('../build/contracts/Crowdsensing.json');
            const contractData = await response.json();
            const abi = contractData.abi;
            
            // Update the contract address below whenever the smart contract is redeployed
            const CONTRACT_ADDRESS = "0x76d0E5265FEA415982dcB2d8Af24d956286eBDFd"; 
            contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);

            console.log("Contract loaded:", contract);

            document.getElementById('submitButton').onclick = submitData;
            document.getElementById('aggregateButton').onclick = aggregateData;
            document.getElementById('aggregateWithDPButton').onclick = aggregateDataWithDP; 
            document.getElementById('loadTransactionsButton').onclick = loadTransactions;
            document.getElementById('zkpButton').onclick = verifyDataWithZKP;

        } catch (error) {
            console.error("Error connecting to MetaMask:", error);
            alert("Failed to connect to MetaMask.");
        }
    } else {
        alert("Please install MetaMask to use this DApp!");
    }
});

// Submit data function
async function submitData() {
    const dataInput = document.getElementById('dataInput').value;
    if (!dataInput) {
        alert("Please enter some data.");
        return;
    }

    try {
        const encryptedData = await encryptDataWithPython(dataInput);
        console.log("Encrypted Data:", encryptedData);

        encryptedValues.push(encryptedData); 

        await contract.methods.submitData(JSON.stringify(encryptedData)).send({ from: accounts[0] });
        alert("Data submitted successfully!");
    } catch (error) {
        console.error("Error submitting data:", error);
        alert("Failed to submit data.");
    }
}

// Aggregate data function
async function aggregateData() {
    try {
        console.log("Encrypted Values to Aggregate:", encryptedValues);

        const response = await fetch('http://localhost:5000/aggregate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ encrypted_values: encryptedValues })
        });

        const result = await response.json();
        console.log("Aggregation Result:", result);

        const { encrypted_result, decrypted_result, noisy_result } = result;

        // Format the display with better readability
        const formattedEncryptedSum = encrypted_result.length > 100 
            ? `${encrypted_result.substring(0, 100)}...`
            : encrypted_result;

        document.getElementById('aggregatedData').innerText =
            `Encrypted Sum: ${formattedEncryptedSum}\n` +
            `Decrypted Sum: ${decrypted_result}\n` +
            `Noisy Sum: ${noisy_result}`;

    } catch (error) {
        console.error("Error aggregating data:", error);
        alert("Failed to aggregate data.");
    }
}

// Aggregate data with differential privacy
async function aggregateDataWithDP() {
    try {
        console.log("Encrypted Values for Differential Privacy Aggregation:", encryptedValues);

        // Send encrypted values to the backend for aggregation with DP
        const response = await fetch('http://localhost:5000/aggregate_with_dp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ encrypted_values: encryptedValues })
        });

        const result = await response.json();
        console.log("Differential Privacy Aggregation Result:", result);

        const { aggregated_result, dp_results } = result;

        let dpResultString = `Aggregated Result (True Sum): ${aggregated_result}\n\nDifferential Privacy Results:\n`;
        dp_results.forEach((dpResult) => {
            dpResultString += `Epsilon: ${dpResult.epsilon}, Noisy Result: ${dpResult.noisy_result}, Noise Difference: ${dpResult.noise_diff_percent.toFixed(2)}%\n`;
        });

        document.getElementById('aggregatedDataWithDP').innerText = dpResultString;

    } catch (error) {
        console.error("Error in DP Aggregation:", error);
        alert("Failed to aggregate data with differential privacy.");
    }
}

// Load transaction
async function loadTransactions() {
  try {
      const latestBlock = await web3.eth.getBlockNumber();
      console.log("Fetching provider addresses...");

      const events = await contract.getPastEvents('DataSubmitted', {
          fromBlock: 0,
          toBlock: 'latest'
      });

      if (events.length === 0) {
          console.log("No transactions found.");
          alert("No transactions found.");
          return;
      }

      const providerAddresses = [...new Set(events.map(event => event.returnValues.provider))];
      console.log("Provider Addresses:", providerAddresses);

      const txList = document.getElementById('transactions');
      if (!txList) {
          console.error("The 'transactions' element is missing from the HTML.");
          alert("Transactions list element not found.");
          return;
      }

      txList.innerHTML = ""; 

      for (const address of providerAddresses) {
          const providerTransactions = events.filter(event => event.returnValues.provider === address);

          for (const tx of providerTransactions) {
              const block = await web3.eth.getBlock(tx.blockNumber);
              const timestamp = new Date(Number(block.timestamp) * 1000).toLocaleString();

              const txItem = document.createElement('li');
              txItem.className = "list-group-item";
              txItem.innerText = `Tx Hash: ${tx.transactionHash}, Time: ${timestamp}, Provider: ${address}`;
              txList.appendChild(txItem);
          }
      }

  } catch (error) {
      console.error("Error loading transactions:", error);
      alert("Failed to load transactions.");
  }
}

// Helper function to get all provider addresses
async function getAllProviderAddresses() {
    try {
        const events = await contract.getPastEvents('DataSubmitted', {
            fromBlock: 0,
            toBlock: 'latest'
        });
        return [...new Set(events.map(event => event.returnValues.provider))]; // Get unique addresses
    } catch (error) {
        console.error("Error fetching provider addresses:", error);
        return [];
    }
}

// Helper function to encrypt data using Python backend
async function encryptDataWithPython(value) {
    try {
        const response = await fetch(`http://localhost:5000/encrypt?value=${value}`);
        const result = await response.json();

        if (!result.ciphertext || result.exponent === undefined) {
            throw new Error("Invalid encryption result from backend");
        }

        return result;
    } catch (error) {
        console.error("Error encrypting data:", error);
        throw error;
    }
}
// Function to verify Data With ZKP
async function verifyDataWithZKP() {
    const dataInput = document.getElementById('dataInput').value;
    if (!dataInput) {
        alert("Please enter some data.");
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/zkp_verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: parseInt(dataInput) })
        });

        const result = await response.json();
        if (result.verified) {
            document.getElementById('zkpResult').innerText = "ZKP Verification: Valid data!";
        } else {
            document.getElementById('zkpResult').innerText = "ZKP Verification: Invalid data!";
        }
    } catch (error) {
        console.error("Error verifying data with ZKP:", error);
        alert("Failed to verify data with ZKP.");
    }
}
