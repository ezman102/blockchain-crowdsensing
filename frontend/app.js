const CONTRACT_ADDRESS = "0xd7Ba84031cf1A2d252c84b858dA2955e0219d39F"; // Replace with actual contract address
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
  if (!dataInput) {
    alert("Please enter some data.");
    return;
  }

  const encryptedData = encryptData(dataInput);
  console.log("Encrypted Data:", encryptedData);

  try {
    await contract.methods.submitData(encryptedData).send({ from: accounts[0] });
    alert("Data submitted successfully!");
  } catch (error) {
    console.error("Error submitting data:", error);
    alert("Failed to submit data.");
  }
}

async function aggregateData() {
    try {
      // Ensure all accounts are defined
      const providerAddresses = accounts.filter(account => !!account);
      console.log("Provider Addresses:", providerAddresses);
  
      const validAddresses = [];
  
      // Validate that providers have submitted data
      for (const address of providerAddresses) {
        const providerData = await contract.methods.dataProviders(address).call();
        if (providerData.encryptedData) {
          validAddresses.push(address);
        }
      }
  
      if (validAddresses.length === 0) {
        alert("No valid provider addresses with data.");
        return;
      }
  
      console.log("Valid Provider Addresses:", validAddresses);
  
      // Execute the aggregation transaction
      const receipt = await contract.methods.aggregateEncryptedData(validAddresses).send({
        from: accounts[0], // Owner account
        gas: 6000000,      // Adjust gas limit as needed
      });
  
      console.log("Transaction Receipt:", receipt);
  
      // Retrieve and display the aggregated result
      const aggregatedSum = await contract.methods.getEncryptedSum().call();
      console.log("Aggregated Data:", aggregatedSum);
      document.getElementById('aggregatedData').innerText = `Aggregated Data: ${aggregatedSum}`;
  
    } catch (error) {
      console.error("Error aggregating data:", error);
      alert("Failed to aggregate data.");
    }
  }
  
  
  
  

function encryptData(data) {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(data);
  return "0x" + Array.from(encoded).map(byte => byte.toString(16).padStart(2, '0')).join('');
}
