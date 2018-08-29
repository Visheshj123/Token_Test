pragma solidity ^0.4.2;
import "./DappToken.sol";
contract DappTokenSale{
  address admin; //state variable access to all func and in blockchain, not public we dont want to expose
    DappToken public tokenContract; //creates instance of DappToken, gives us an address
    uint256 public tokenPrice; //solidity gives us a function automatically
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

  function DappTokenSale(DappToken _tokenContract, uint256 _tokenPrice) public {
    //assign an Admin
    admin = msg.sender; //admin is person who deployed contract
    //Token contract
    tokenContract = _tokenContract;
    //Set Token Price
    tokenPrice = _tokenPrice;



  }
  //multiply function
  function multiply(uint x, uint y) internal pure returns (uint z){ //pure takes in func of same data tpe and reutns that type
    require(y == 0 || (z = x * y)/y == x);
  }

  //buy some tokens
  function buyTokens(uint256 _numberofTokens) public payable{ //willl be expoed to client side interface
    //Require that value is equal to tokens, msg.value is the person calling this function, found in metadata
    require(msg.value == multiply(_numberofTokens, tokenPrice));
    //Require that the contract has enough tokens, must trasfer total supply
    require(tokenContract.balanceOf(this) >= _numberofTokens); //passes address of tokenContractSale in 'this' keyword
    require(tokenContract.transfer(msg.sender, _numberofTokens)); //msg.sender is person who called this function

    //Require transfer is successful
    //keep track of tokensSold
    tokensSold += _numberofTokens; //will start at 0
    //Trigger Sell Event
    Sell(msg.sender, _numberofTokens); //seller is the msg.sender
  }

  function endSale() public {
      //require only admin can do this
      require(msg.sender == admin); //requires function caller is admin
      //transfer amount of tokens in the sale back to admin
      require(tokenContract.transfer(admin, tokenContract.balanceOf(this))); //transfer TO admin for the amount within the tokenContractSale
      //Destroy Contract
      selfdestruct(admin);

  }


}
