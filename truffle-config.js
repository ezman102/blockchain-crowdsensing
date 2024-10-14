const HDWalletProvider = require('@truffle/hdwallet-provider'); // Required for testnets like Sepolia
require('dotenv').config(); // Load environment variables

const mnemonic = process.env.MNEMONIC;
const infuraKey = process.env.INFURA_KEY;

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ganache port (default: none)
      network_id: "*",       // Any network (default: none)
      // gas: 12000000, // Increase the block gas limit
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
      confirmations: 2,       // # of confirmations to wait between deployments
      timeoutBlocks: 200,     // # of blocks before a deployment times out
      skipDryRun: true        // Skip dry run before migrations
    }
  },

  compilers: {
    solc: {
      version: "0.8.20",      // Fetch exact version from solc-bin (default: truffle's version)
    }
  }
};
