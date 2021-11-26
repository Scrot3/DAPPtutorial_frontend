pragma solidity >=0.4.2 <0.9.0;

contract DappToken {
	// Constructor
	// Set the total number of tokens
	// Read the total number of tokens
	uint256 public totalSupply; // written to blockchain, public. ERC20 standard, required for totalSupply function. 
								// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md 

	constructor() {
		totalSupply = 1000000; // state variable. accessible to entire contract. Write to storage.
	}


}