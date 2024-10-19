let web3;
let contract;
let accounts;
let encryptedValues = []; // Initialize encryptedValues array globally

window.addEventListener('load', async () => {
    if (window.ethereum) {
        try {
            // Initialize Web3 with MetaMask's provider
            web3 = new Web3(window.ethereum);
            await ethereum.request({ method: 'eth_requestAccounts' });
            accounts = await web3.eth.getAccounts();

            document.getElementById('account').innerText = accounts[0];
            console.log("Connected account:", accounts[0]);

            const response = await fetch('Crowdsensing.json');
            const contractData = await response.json();
            const abi = contractData.abi;

            const CONTRACT_ADDRESS = "0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab"; 
            contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);

            console.log("Contract loaded:", contract);

            // Bind the button events AFTER the contract and functions are defined
            document.getElementById('submitButton').onclick = submitData;
            document.getElementById('aggregateButton').onclick = aggregateData;
            document.getElementById('loadTransactionsButton').onclick = loadTransactions;

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

        encryptedValues.push(encryptedData); // Store encrypted data globally

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

        document.getElementById('aggregatedData').innerText = 
            `Encrypted Sum: ${result.encrypted_result}, Decrypted Sum: ${result.decrypted_result}`;

    } catch (error) {
        console.error("Error aggregating data:", error);
        alert("Failed to aggregate data.");
    }
}

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

      txList.innerHTML = ""; // Clear previous transactions if any

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
