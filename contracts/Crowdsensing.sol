// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Crowdsensing {
    struct DataProvider {
        address provider;
        string[] encryptedData;
        uint rewardBalance; 
        bool verified;
    }

    address public owner;
    mapping(address => DataProvider) public dataProviders;
    uint public dataCount;
    string public lastAggregatedSum;

    event DataSubmitted(address indexed provider, string encryptedData);
    event AggregationComplete(string encryptedSum);
    event RewardDistributed(address indexed provider, uint amount);
    event RewardClaimed(address indexed provider, uint amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    function submitData(string memory encryptedData) public {
        if (dataProviders[msg.sender].provider == address(0)) {
            dataProviders[msg.sender].provider = msg.sender;
        }
        dataProviders[msg.sender].encryptedData.push(encryptedData);
        dataCount++;
        emit DataSubmitted(msg.sender, encryptedData);
    }

    function aggregateEncryptedData(
        address[] memory providerAddresses
    ) public onlyOwner returns (string memory) {
        require(providerAddresses.length > 0, "No provider addresses provided");

        string memory encryptedSum;
        for (uint i = 0; i < providerAddresses.length; i++) {
            address provider = providerAddresses[i];
            require(
                dataProviders[provider].encryptedData.length > 0,
                "No data submitted"
            );
            for (uint j = 0; j < dataProviders[provider].encryptedData.length; j++) {
                encryptedSum = string(
                    abi.encodePacked(
                        encryptedSum,
                        dataProviders[provider].encryptedData[j]
                    )
                );
            }
        }
        lastAggregatedSum = encryptedSum;
        emit AggregationComplete(encryptedSum);
        return encryptedSum;
    }

    function distributeRewards(
        address[] memory providerAddresses,
        uint[] memory rewardAmounts
    ) public payable onlyOwner {
        require(
            providerAddresses.length == rewardAmounts.length,
            "Mismatch between addresses and rewards"
        );

        uint totalReward = 0;
        for (uint i = 0; i < rewardAmounts.length; i++) {
            totalReward += rewardAmounts[i];
        }

        require(
            msg.value == totalReward,
            "Insufficient Ether sent for rewards"
        );

        for (uint i = 0; i < providerAddresses.length; i++) {
            address provider = providerAddresses[i];
            require(
                dataProviders[provider].provider != address(0),
                "Provider not found"
            );
            dataProviders[provider].rewardBalance += rewardAmounts[i];
            emit RewardDistributed(provider, rewardAmounts[i]);
        }
    }

    function claimReward() public {
        uint reward = dataProviders[msg.sender].rewardBalance;
        require(reward > 0, "No rewards available to claim");
        require(address(this).balance >= reward, "Insufficient contract balance");

        dataProviders[msg.sender].rewardBalance = 0;
        payable(msg.sender).transfer(reward);

        emit RewardClaimed(msg.sender, reward);
    }

    function getRewardBalance(address provider) public view returns (uint) {
        return dataProviders[provider].rewardBalance;
    }

    function getLastAggregatedSum() public view returns (string memory) {
        return lastAggregatedSum;
    }

    // Fallback function to accept Ether
    receive() external payable {}
}
