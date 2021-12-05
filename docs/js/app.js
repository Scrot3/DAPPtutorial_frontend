App = {
	web3Provider: null,
	contracts: {},
	account: '0x0',
	loading: false,
	tokenPrice: 1000000000000000,
	tokensSold: 0,
	tokensAvailable: 750000,

	init: function() {
		console.log("App initialized...")
		return App.initWeb3();
	},
	initWeb3: function() { // Initialize web3 for being able to talk to blockchain
		if (typeof web3 !== 'undefined'){
			// If a web3 instance is already provided by MetaMask. On Metamask, need to make sure, I am on right network, and maybe have a key imported.
			App.web3Provider = web3.currentProvider;
			web3 = new Web3(web3.currentProvider);
		}else{
			// Specify default instance if no web3 instance provided
			App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
			web3 = new Web3(App.web3Provider);
		}
		return App.initContracts();
	},

	initContracts: function() {
		$.getJSON("DappTokenSale.json", function(dappTokenSale){
			App.contracts.DappTokenSale = TruffleContract(dappTokenSale);
			App.contracts.DappTokenSale.setProvider(App.web3Provider);
			App.contracts.DappTokenSale.deployed().then(function(dappTokenSale){
				console.log("Dapp Token Sale Address", dappTokenSale.address);
			});
		}).done(function() {
			$.getJSON("DappToken.json", function(dappToken){
			App.contracts.DappToken = TruffleContract(dappToken);
			App.contracts.DappToken.setProvider(App.web3Provider);
			App.contracts.DappToken.deployed().then(function(dappToken){
				console.log("Dapp Token Address", dappToken.address);
			});
			App.listenForEvents(); // Activate listenForEvents.
			return App.render();
			});	
		});
	},

	// listen for events emitted from the contract
	listenForEvents: function() {
		App.contracts.DappTokenSale.deployed().then(function(instance) {
			instance.Sell({}, {
				fromBlock: 0,
				toBlock: 'latest',

			}).watch(function(error,event) {
				console.log("even triggered", event);
				App.render();
			})
		})
	},

	// Get access to the account we are connected to:
	render: function() {
		if (App.loading) {
			return;
		}
		App.loading = true;

		var loader = $('#loader'); // This connects to 'id=loader' in HTML
		var content = $('#content'); // This connects to 'id=content' in HTML

		loader.show();
		content.hide();

		// load account data
		web3.eth.getCoinbase(function(err, account) {
			if(err === null) {
				console.log("account", account);
				App.account = account;
				$('#accountAddress').html("Your Account: " + account); // Querying for the accountAddress in index.html
			}
		})

		// Load token sale contract
		App.contracts.DappTokenSale.deployed().then(function(instance){
			dappTokenSaleInstance = instance;
			return dappTokenSaleInstance.tokenPrice();
		}).then(function(tokenPrice){
  			App.tokenPrice = tokenPrice;
  			$('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
  			return dappTokenSaleInstance.tokensSold();
		}).then(function(tokensSold){
			App.tokensSold = tokensSold.toNumber();
			$('.tokens-sold').html(App.tokensSold);
			$('.tokens-available').html(App.tokensAvailable);

			var progressPercent = (App.tokensSold / App.tokensAvailable) * 100;
			console.log(progressPercent);
			$('#progress').css('width', progressPercent + '%');

			// Load token contract
			App.contracts.DappToken.deployed().then(function(instance){
				dappTokenInstance = instance;
				console.log(App.account)
				return dappTokenInstance.balanceOf(App.account);

			}).then(function(balance){
				console.log(balance.toNumber())
				$('.dapp-balance').html(balance.toNumber());


				App.loading = false;
				loader.hide();
				content.show();

			});

		});
	},

	buyTokens: function() {
		$('#content').hide();
		$('#loader').show();
		var numberOfTokens = $('#numberOfTokens').val();
		App.contracts.DappTokenSale.deployed().then(function(instance) {
			return instance.buyTokens(numberOfTokens, {
				from: App.account,
				value: numberOfTokens * App.tokenPrice,
				gas: 500000 // Gas limit
			});
		}).then(function(result) {
			console.log("Tokens bought...")
			// Wait for Sell event
		});
	}
}

$(function(){ // This is jQuery code to initialize app.
	$(window).load(function() {
		App.init();
	})
})