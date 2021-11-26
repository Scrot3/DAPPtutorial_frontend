pragma solidity >=0.4.2 <0.9.0;

contract DappToken {
	// Name
	string public name = "DApp Token";
	// Symbol
	string public symbol = "DAPPPP";
	string public standard = "DApp token v1.0";

	// Constructor
	// Set the total number of tokens
	// Read the total number of tokens
	uint256 public totalSupply; // written to blockchain, public. ERC20 standard, required for totalSupply function. 
								// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md 


	event Transfer(
		address indexed _from,
		address indexed _to,
		uint256 _value
		);
	mapping(address => uint256) public balanceOf;

	constructor(uint256 _initialSupply) {
		balanceOf[msg.sender] = _initialSupply; // msg is a global variable, has several values, like sender.
		totalSupply = _initialSupply; // state variable. accessible to entire contract. Write to storage.
		// allocate the initial supply

	}

	// Transfer 
	function transfer(address _to, uint256 _value) public returns (bool success) {
		// Exception if account doesn't have enough
		require(balanceOf[msg.sender] >= _value);
		// Transfer the balance
		balanceOf[msg.sender] -= _value;
		balanceOf[_to] += _value;

		// Transfer Event
		emit Transfer(msg.sender, _to, _value);

		// Return a boolean
		return true;
	}

}