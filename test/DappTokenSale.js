var DappToken = artifacts.require("DappToken.sol");
var DappTokenSale = artifacts.require("DappTokenSale.sol");

contract('DappTokenSale', function(accounts) {
	var tokenSale;
	var tokenSaleInstance;
	var admin = accounts[0];
	var buyer = accounts[1];
	var tokenPrice = 1000000000000000; // in wei
	var tokensAvaliable = 750000;
	var numberOfTokens;

	it('initializes the contract with the correct values' ,function(){
		return DappTokenSale.deployed().then(function(instance){
			tokenSaleInstance = instance;
			return tokenSaleInstance.address;
		}).then(function(address){
			assert.notEqual(address, 0x0,'has contract address');
			return tokenSaleInstance.tokenContract();
		}).then(function(address){
			assert.notEqual(address, 0x0,'has token contract address');
			return tokenSaleInstance.tokenPrice();
		}).then(function(price){
			assert.equal(price, tokenPrice, 'token price is correct');
		});
	});

	it('facilitates token buying', function() {
		return DappToken.deployed().then(function(instance){
			// Grab token instance first
			tokenInstance = instance;
			return DappTokenSale.deployed();
		}).then(function(instance){
			// Then grab token sale instance
			tokenSaleInstance = instance;
			// Provision 75% of all tokens to the token sale
			return tokenInstance.transfer(tokenSaleInstance.address, tokensAvaliable, { from: admin });
		}).then(function(receipt){

			numberOfTokens = 10;
			return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: numberOfTokens * tokenPrice}); // Meta data in {}
		}).then(function(receipt){
			assert.equal(receipt.logs.length, 1, 'triggers one event');
			assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
			assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
			assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the number of tokens purchased');
			
			return tokenSaleInstance.tokensSold();
		}).then(function(amount){
			assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold');
			return tokenInstance.balanceOf(buyer);
		}).then(function(balance){
			assert.equal(balance.toNumber(), numberOfTokens);
			return tokenInstance.balanceOf(tokenSaleInstance.address);
		}).then(function(balance){
			assert.equal(balance.toNumber(), tokensAvaliable - numberOfTokens);
			// Try to buy tokens different from ether value
			return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1  } ); // Try buying token for 1 wei.
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');
			return tokenSaleInstance.buyTokens(800000, { from: buyer, value: 800000 * tokenPrice  } ); // Try buying token for 1 wei.
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >= 0, 'cannot purchase more tokens than available'); // Whatever error happens before, it resorts to this error message... hm... not ideal...
		});
	});

	it('ends token sale', function() {
		return DappToken.deployed().then(function(instance) {
			// Grab token instance first
			tokenInstance = instance;
			return DappTokenSale.deployed();
		}).then(function(instance){
			// then grab token sale instance
			tokenSaleInstance = instance;
			// Try to end sale from account other than the admin
			return tokenSaleInstance.endSale({ from: buyer});
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >= 0, 'must be admin to end sale');
			return tokenSaleInstance.endSale({ from: admin });
		}).then(function(receipt) {
			return tokenInstance.balanceOf(admin);
		}).then(function(balance) {
			assert.equal(balance.toNumber(),999990, 'return all unsold Dapptokens to admin');
			// Check that contract has no balance
			return balance = web3.eth.getBalance(tokenSaleInstance.address);
		}).then(function(balance) {
			assert.equal(balance,0);

		});
	});
})