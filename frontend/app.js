const CONTRACT_ADDRESS = "0xDB4cC017b9F06591A634926191f3297274c1fB9D"; // Replace with actual contract address
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
  

  async function submitData() {
    const dataInput = document.getElementById('dataInput').value;
    
    if (!dataInput || isNaN(dataInput)) {
      alert("Please enter a valid numeric value.");
      return;
    }
  
    try {
      const encryptedData = await encryptDataWithPython(dataInput);
      console.log("Encrypted Data:", encryptedData);
  
      await contract.methods.submitData(encryptedData).send({ from: accounts[0] });
      alert("Data submitted successfully!");
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("Failed to submit data.");
    }
  }
  
  
  
  async function encryptDataWithPython(data) {
    try {
      const response = await fetch(`http://localhost:5000/encrypt?value=${data}`);
  
      if (!response.ok) {
        throw new Error('Encryption request failed');
      }
  
      const result = await response.json();
  
      if (!result.encrypted) {
        throw new Error('Invalid encryption result from backend');
      }
  
      console.log("Encrypted Data:", result.encrypted);
      return result.encrypted;  // Ensure this is returned as a string
    } catch (error) {
      console.error("Error encrypting data:", error);
      throw error;
    }
  }
  
  
  
  
  async function aggregateData() {
    try {
      const validAddresses = [];
  
      for (let i = 0; i < accounts.length; i++) {
        const providerData = await contract.methods.dataProviders(accounts[i]).call();
        if (providerData.encryptedData) {
          validAddresses.push(accounts[i]);
        }
      }
  
      if (validAddresses.length === 0) {
        alert("No valid provider data available for aggregation.");
        return;
      }
  
      await contract.methods.aggregateEncryptedData(validAddresses).send({
        from: accounts[0], // Ensure this is the owner account
        gas: 6000000,
      });
  
      const aggregatedSum = await contract.methods.getEncryptedSum().call();
      document.getElementById('aggregatedData').innerText = `Aggregated Data: ${aggregatedSum}`;
      alert("Aggregation completed successfully!");
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
