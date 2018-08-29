var DappToken = artifacts.require("./DappToken.sol");

contract('DappToken', function(accounts){//takes in all of ganache accouts


  it('intializes the contract with the correct values', function(){
    return DappToken.deployed().then(function(instance){
      tokenInstance = instance;
      return tokenInstance.name();
  }).then(function(name){
    assert.equal(name, 'DApp Token', 'has the correct name');
    return tokenInstance.symbol();
}).then(function(symbol){
    assert.equal(symbol, 'DAPP', 'has correct symbol');
    return tokenInstance.standard();
}).then(function(standard){
  assert.equal(standard, 'DApp Token v1.0', 'has correct standard');
});
})

  it('sets the total supply upno deployment', function() { //makes and runs pseudofunction
    return DappToken.deployed().then(function(instance){ //first deploys, waits, then runs with instance arg
      tokenInstance = instance;
      return tokenInstance.totalSupply(); //obtain value
    }).then(function(totalSupply){
      assert.equal(totalSupply.toNumber(), 1000000, 'sets total supply to 1,000,000');
      return tokenInstance.balanceOf(accounts[0]);
    }).then(function(adminBalance){ //test places return result into adminBalance var and makes sure it is equal to 1,000,000
      assert.equal(adminBalance.toNumber(), 1000000, 'it allocates the initial supply to the admin account');
    });
  });

  it('transfers token ownership', function(){
      return DappToken.deployed().then(function(instance){
        tokenInstance = instance;
        //Test 'require' statement of DappToken.sol by transferring something larger than the sender's balance
        return tokenInstance.transfer.call(accounts[1], 9999999999999999); //should give account 1 this much, should fail as we are calling function
      }).then(assert.fail).catch(function(error){ //places err in error var
        assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
          return tokenInstance.transfer.call(accounts[1], 250000, {from: accounts[0]}); //.call will be actual return value of function
      }).then(function(success){
          assert.equal(success, true, 'it returns true');
          return tokenInstance.transfer(accounts[1], 250000, { from: accounts[0]});
      }).then(function(receipt){ //is the event
        assert.equal(receipt.logs.length, 1, 'triggers one event');
        assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
        assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
        assert.equal(receipt.logs[0].args._value, 250000, 'logs the transfer amount');
        return tokenInstance.balanceOf(accounts[1]);
      }).then(function(balance){
        assert.equal(balance.toNumber(), 250000, 'adds the amount to recieving account');
        return tokenInstance.balanceOf(accounts[0]);
        assert.equal(balance.toNumber(), 750000, 'deducts the amount from the sending account');
      })
  });
  it('approves tokens for delegated transfer', function(){
    return DappToken.deployed().then(function(instance){
      TokenInstance = instance;
      return tokenInstance.approve.call(accounts[1], 100) //allow accounts[1] to use accounts[0] tokens, 100
    }).then(function(success){
      assert.equal(success, true, 'it returns true');  //should return true
      return tokenInstance.approve(accounts[1], 100, {from: accounts[0] }); //outputs a receipt
    }).then(function(receipt){
      assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event');
      assert.equal(receipt.logs[0].args._owner, accounts[0], 'Approves there is an owner');
      assert.equal(receipt.logs[0].args._spender, accounts[1], 'Approves there is a sender');
      assert.equal(receipt.logs[0].args._value, 100, 'Approves allowance');
      return tokenInstance.allowance(accounts[0], accounts[1])
    }).then(function(allowance){
      assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated transfer'); //ensures accounts[1] ca use 100 tokens
    });
  });

  it('Handles delegated transfer', function(){
    return DappToken.deployed().then(function(instance){
      TokenInstance = instance;
      fromAccount = accounts[2];
      toAccount = accounts[3];
      spendingAccount = accounts[4]; //will be msg.sender in tokens
      return tokenInstance.transfer(fromAccount, 100, { from:accounts[0] }); //giving 100 tokens to fromAccounts
  }).then(function(receipt){
    return tokenInstance.approve(spendingAccount, 10, {from: fromAccount }); //allows spendingAccount to use 10 fromAccount's tokens
  }).then(function(receipt){
      //try trafer something larger than sender's balance
      return tokenInstance.transferForm(fromAccount, toAccount, 150, {from: spendingAccount }); //spendingAccount tries to use too many of fromAccount's tokens
  }).then(assert.fail).catch(function(error){
    assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than balance');
    //try transfer larger than approved amount
    return tokenInstance.transferForm(fromAccount, toAccount, 11, {from: spendingAccount });
  }).then(assert.fail).catch(function(error){
    assert(error.message.indexOf('revert') >=0, 'cannot transfer more than approved amount');
    return tokenInstance.transferForm.call(fromAccount, toAccount, 10, {from: spendingAccount }); //ensure function output is working correctly
  }).then(function(success){
    assert.equal(success, true, 'Test passed successfully');
    return tokenInstance.transferForm(fromAccount, toAccount, 10, {from: spendingAccount });
  }).then(function(receipt){
    assert.equal(receipt.logs.length, 1, 'triggers one event');
    assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
    assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account the tokens are transferred from');
    assert.equal(receipt.logs[0].args._to, toAccount, 'logs the account the tokens are transferre to');
    assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');
    return tokenInstance.balanceOf(fromAccount);
  }).then(function(balance){
    assert.equal(balance.toNumber(), 90, 'takes money from account');
    return tokenInstance.balanceOf(toAccount);
  }).then(function(balance){
    assert.equal(balance, 10, 'adds the amount to the recievers account');
    return tokenInstance.allowance(fromAccount, spendingAccount);
  }).then(function(allowance){
    assert.equal(allowance.toNumber(), 0, 'spent all allowance');
  });
});

})
