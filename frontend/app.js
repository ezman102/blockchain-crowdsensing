const CONTRACT_ADDRESS = "0x46e3DBe3b124A658fbcE2Bcc52025AbcE4EE4c25"; // Replace with actual contract address
let contract;
let accounts;

window.addEventListener('load', async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      await ethereum.request({ method: 'eth_requestAccounts' });
      accounts = await web3.eth.getAccounts();
  
      document.getElementById('account').innerText = accounts[0];
      console.log("Connected account:", accounts[0]);
  
      const response = await fetch('Crowdsensing.json');
      const contractData = await response.json();
      const abi = contractData.abi;
  
      contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
      console.log("Contract loaded:", contract);
  
      // Bind the button click events AFTER the contract loads
      document.getElementById('submitButton').onclick = submitData;
      document.getElementById('aggregateButton').onclick = aggregateData;
    } else {
      alert("Please install MetaMask to use this DApp!");
    }
  });
  

  let encryptedValues = [];  // Store encrypted values globally

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
  
  async function submitData() {
    const dataInput = document.getElementById('dataInput').value;
    if (!dataInput) {
      alert("Please enter some data.");
      return;
    }
  
    try {
      const encryptedData = await encryptDataWithPython(dataInput);
      console.log("Encrypted Data:", encryptedData);
  
      // Store encrypted value in global array for aggregation
      encryptedValues.push(encryptedData);
  
      await contract.methods.submitData(JSON.stringify(encryptedData)).send({ from: accounts[0] });
      alert("Data submitted successfully!");
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("Failed to submit data.");
    }
  }
  
  

  async function aggregateData() {
    try {
      if (encryptedValues.length === 0) {
        alert("No encrypted data available to aggregate.");
        return;
      }
  
      console.log("Encrypted Values to Aggregate:", encryptedValues);
  
      const response = await fetch('http://localhost:5000/aggregate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encrypted_values: encryptedValues })  // Use real encrypted values
      });
  
      const result = await response.json();
      console.log("Aggregation Result:", result.result);
  
      document.getElementById('aggregatedData').innerText = `Aggregated Data: ${result.result}`;
    } catch (error) {
      console.error("Error aggregating data:", error);
      alert("Failed to aggregate data.");
    }
  }
  
  
  
  
  
  
  
  document.getElementById('resetButton').onclick = async () => {
    try {
      const providerAddress = accounts[0]; // Example: Reset data for the current account
      await contract.methods.resetProviderData(providerAddress).send({ from: accounts[0] });
  
      alert(`Data for ${providerAddress} has been reset!`);
    } catch (error) {
      console.error("Error resetting data:", error);
      alert("Failed to reset data.");
    }
  };
  

function encryptData(data) {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(data);
  return "0x" + Array.from(encoded).map(byte => byte.toString(16).padStart(2, '0')).join('');
}
