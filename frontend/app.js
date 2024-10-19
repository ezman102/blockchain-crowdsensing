const CONTRACT_ADDRESS = "0x001D25ae28Ca80256fEaC951907A40d8Ed377BD3"; // Replace if different
let contract;
let accounts;

// Connect to the blockchain
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
  } else {
    alert("Please install MetaMask to use this DApp!");
  }
});

// Function to submit encrypted data
async function submitData() {
  const dataInput = document.getElementById('dataInput').value;
  if (!dataInput) {
    alert("Please enter some data.");
    return;
  }
  try {
    await contract.methods.submitData(dataInput).send({ from: accounts[0] });
    alert("Data submitted successfully!");
  } catch (error) {
    console.error("Error submitting data:", error);
    alert("Failed to submit data.");
  }
}

// Function to aggregate data
// Function to aggregate data
async function aggregateData() {
    try {
      // Fetch all data providers (you may need to define them or get them dynamically)
      const providerAddresses = [
        "0x01B0348d4DccAf44439ea692E2CE714281F9751d", // Example address 1
        "0xB46507AB476c8c36381F05D5066E946848e1d476", // Example address 2
        "0xA235564280960a0E55f1Fb53BF882E2e1174bF64"  // Example address 3
      ]; 
  
      // Call aggregateEncryptedData with provider addresses
      await contract.methods.aggregateEncryptedData(providerAddresses).send({ from: accounts[0] });
  
      // Fetch the aggregated encrypted sum from the contract
      const aggregatedSum = await contract.methods.getEncryptedSum().call();
  
      // Display the result in the frontend
      document.getElementById('aggregatedData').innerText = `Aggregated Data: ${aggregatedSum}`;
    } catch (error) {
      console.error("Error aggregating data:", error);
      alert("Failed to aggregate data.");
    }
  }
  