const HDWalletProvider = require('@truffle/hdwallet-provider'); // Required for testnets like Sepolia
require('dotenv').config(); 

const mnemonic = process.env.MNEMONIC;
const infuraKey = process.env.INFURA_KEY;

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost 
      port: 8545,            // Standard Ganache port 
      network_id: "*",       
    },
    sepolia: {
      provider: () => new HDWalletProvider({
        mnemonic: {
          phrase: mnemonic
        },
        providerOrUrl: `https://sepolia.infura.io/v3/${infuraKey}`,
        chainId: 11155111
      }),
      network_id: 11155111,   // Sepolia's network id
      gas: 4500000,
      confirmations: 2,      
      timeoutBlocks: 200,    
      skipDryRun: true      
    }
  },

  compilers: {
    solc: {
      version: "0.8.20",   
    }
  }
};
