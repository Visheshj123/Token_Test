//whenver window loads, we should see this on console
App = {
  web3Provider: null,

  init: function(){
    console.log("app initialized...")
    return App.initWeb3();
  },
  initWeb3: function(){
    if(typeof web3 !== 'undefined'){
      //If web3 instance is already provided by MetaMask
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    }else {
      //specifiy default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },
  initContracts: function(){
    $.getJSON("DappTokenSale.json", function(DappTokenSale){
      App.contracts.DappTokenSale = TruffleContract(DappTokenSale);
      App.contracts.DappTokenSale.setProvider(App.web3Provider);
      App.contracts.DappTokenSale.deployed().then(function(DappTokenSale){
        console.log("Dapp token sale address", DappTokenSale.address);
      })
    })
  }
}
$(function(){
  $(window).load(function(){
    App.init();
  })
});
