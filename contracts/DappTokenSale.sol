pragma solidity ^0.8.0;


/* How it works
1. Provision tokens to token sale contract
2. Set a token price in Wei
3. Assign an admin
4. Buy tokens
5. End sale
*/

import "./DappToken.sol";

contract DappTokenSale {
	address payable admin ; // admin is a state variable, which belongs to the contract, written to blockchain
							// admin needs to be payable because it gets any remaining balance from contract when closing out.
	// DappToken public tokenContract; // tokenContract is of datatype DappToken. This will give us a getter with the same name since it is a public variable.
	DappToken public tokenContract;
	uint256 public tokenPrice;
	uint256 public tokensSold;

	event Sell(address _buyer, uint256 _amount);

	constructor(DappToken _tokenContract, uint256 _tokenPrice) public {
		// Assign an admin (external account connected to blockchain who has special privileges. e.g. end token sale)
		admin = payable(msg.sender); // who deploys the contract is the admin.

		// Add reference to Token Contract
		tokenContract = _tokenContract;

		// Set Token price 
		tokenPrice = _tokenPrice;
	}

	// multiply function, sourced from: github.com/dapphub/ds-math/blob/master/src/math.sol
	function multiply(uint x, uint y) internal pure returns (uint z) { // internal, so it is only visible inside contract. pure, so it is not reading or writing data to blockchain
		require(y == 0 || (z = x * y) / y == x);
	}


	// Buy Tokens
	function buyTokens(uint256 _numberOfTokens) public payable { // 'payable' for someone to be able to send ether for the transaction.

		// Require that value is equal to tokens *** hard
		require(msg.value == multiply(_numberOfTokens, tokenPrice)); // msg.value is the amount in wei that sender is sending.

		// Require that the contract has enough tokens *** hard
		// first, need to provision enough tokens to token sale contract.
		require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);

		// Require that a transfer is successful *** hard
		require(tokenContract.transfer(msg.sender, _numberOfTokens));

		// Keep track of token sold
		tokensSold += _numberOfTokens;

		// Emit sell event
		emit Sell(msg.sender, _numberOfTokens);
	}

	// Ending Token DappTokenSale
	function endSale() public {
		// Require admin
		require(msg.sender == admin);

		// Transfer remaining dapp tokens to admin
		require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
		
		// Let's not destroy the contract here. just transfer the balance to the admin.
		admin.transfer(address(this).balance);


	}


}





