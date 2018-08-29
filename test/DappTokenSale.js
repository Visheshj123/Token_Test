var DappToken = artifacts.require('./DappToken');
var DappTokenSale = artifacts.require('./DappTokenSale');

contract ('DappTokenSale', function(accounts){ //intalizing gives us access to Ganache accounts
  var tokenSaleInstance;
  var tokenPrice = 1000000000000; //in wei, 12 0's
  var buyer = accounts[1];
  var admin = accounts[0];
  var numberofTokens;
  var tokenInstance;
  var tokensAvailable = 750000;
  it ('initializes the contract with the correct values', function() {
    return DappTokenSale.deployed().then(function(instance){
      tokenSaleInstance = instance;
      return tokenSaleInstance.address
    }).then(function(address){
      assert.notEqual(address, 0x0, 'has contract address thats not 0x0');
      return tokenSaleInstance.tokenContract();
    }).then(function(address){
      assert.notEqual(address, 0x0, 'has a token contract');
      return tokenSaleInstance.tokenPrice();
    }).then(function(price){
      assert.equal(price, tokenPrice, 'token price is correct');
    });
  });

  it('facilitates token buying', function(){
      return DappToken.deployed().then(function(instance){
        tokenInstance = instance;
        return DappTokenSale.deployed();
      }).then(function(instance){
        tokenSaleInstance = instance;
        //provision 75% of all tokens to tokenSale
        return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, {from: admin}); //admin has all tokens
      }).then(function(receipt){
        numberofTokens = 10;
        //numberofTokens = 10;
        return tokenSaleInstance.buyTokens(numberofTokens, {from: buyer, value: numberofTokens * tokenPrice})//value is the amount of wei needed to buy a certain number of tokens
      }).then(function(receipt){
        assert.equal(receipt.logs.length, 1, 'triggers one event');
        assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
        assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased tokens');
        assert.equal(receipt.logs[0].args._amount, numberofTokens, 'logs the number of tokens purchased');
        return tokenSaleInstance.tokensSold();
      }).then(function(amount){
        assert.equal(amount.toNumber(), numberofTokens, 'increments the number of tokens sold');
        return tokenInstance.balanceOf(buyer);
      }).then(function(balance){
        assert.equal(balance.toNumber(), numberofTokens);
        return tokenInstance.balanceOf(tokenSaleInstance.address) //checks if transfer function as worked
      }).then(function(balance){
        assert.equal(balance.toNumber(), tokensAvailable - numberofTokens);
        //try to buy tokens different from ether value
        return tokenSaleInstance.buyTokens(numberofTokens, {from: buyer, value: 1});
      }).then(assert.fail).catch(function(error){
        assert(error.message.indexOf('revert') >= 0, 'msg.value must equal numebr of tokens in wei');
        return tokenSaleInstance.buyTokens(80000000, {from: buyer, value: numberofTokens * tokenPrice})
      }).then(assert.fail).catch(function(error){
       assert(error.message.indexOf('revert') >= 0, 'cannot purchase more tokens than avilable');
  });

  });

  it('ends token sale', function(){
    return DappToken.deployed().then(function(instance){
      tokenInstance = instance;
      return DappTokenSale.deployed();
    }).then(function(instance){
      tokenSaleInstance = instance;
      //try to end sale from account NOT admin
      return tokenSaleInstance.endSale({from: buyer });
    }).then(assert.fail).catch(function(error){
      assert(error.message.indexOf('revert' >= 0, 'must be admin to end sale'));
      //End Sale as Admin
      return tokenSaleInstance.endSale({from: admin});
    }).then(function(receipt){
      return tokenInstance.balanceOf(admin);
    }).then(function(balance){
      assert.equal(balance.toNumber(), 999990, 'returns all unsold dapptokens to admin')
      return tokenSaleInstance.tokenPrice();
    }).then(function(price){
      assert.equal(price.toNumber, 0, 'tokenPrice reset to 0, self destruct confirmed')
    })

  });





});
