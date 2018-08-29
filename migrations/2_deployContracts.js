//intial migration will run when deploying, allows you to change state of database you are working on
var DappToken = artifacts.require("./DappToken.sol"); //artificats helps truffle interact with contract in JRE
var DappTokenSale = artifacts.require("./DappTokenSale.sol");

module.exports = function(deployer) {
  deployer.deploy(DappToken, 1000000).then(function(){
    var tokenPrice = 1000000000000;
    return deployer.deploy(DappTokenSale, DappToken.address, tokenPrice);
  }); //subsequent args will be passed to Constructor function of .sol

};
