pragma solidity ^0.4.2;

contract DappToken{

  string public name = 'DApp Token';
  string public symbol = 'DAPP';
  string public standard = 'DApp Token v1.0';
  //variable of type uint256, positive ints, 256 bits, global variable, allows us to read it when deployed
  uint256 public totalSupply; //Solodity will provide function that returns value for this

  event Transfer( //triggers when a transfer is done
      address indexed _from, //indexed keyword used for logged events, allows seach for events
      address indexed _to,
      uint256 _value
    );

  event Approval(
    address indexed _owner,
    address indexed _spender,
    uint256 _value
    );

  mapping(address => uint256) public balanceOf; //key-value pair called balanceOf, address is key, value is balance
  mapping(address => mapping(address => uint256)) public allowance; //(X:(Z:Y)) X approved Z to spend Y

  function DappToken(uint256 _intialSupply) public{ //Constructor function that makes total amount of tokens
    balanceOf[msg.sender] = _intialSupply; //sets the address value to the intial supply, msg is a global variable in solidity
    totalSupply = _intialSupply; //sets number of tokens to _intialSupply, underscore is convention
    //allocate intial supply
  }

  //Transfer function, must trigger Transfer Event, must throw if _from doesn't have enough, return bool
  function transfer(address _to, uint256 _value) public returns (bool success){ //address is a sata type in Solidity
      require(balanceOf[msg.sender] >= _value); //will throw error if false

      balanceOf[msg.sender] -= _value;
      balanceOf[_to] += _value;

      Transfer(msg.sender, _to, _value);
      return true;
    }

 //implement function that handles transfer for recieving or delegated transfer
 //function to 'approve' a transfer in which someone else spends your tokens
      //must have approval event for the approve method
 //once approved, the transferform() will execute the transfer
 //amount to be traded will be stored in allowance()

 function approve(address _spender, uint256 _value) public returns (bool success){

   allowance[msg.sender][_spender] = _value; //uses allowance mapping

   Approval(msg.sender,_spender, _value);
   return true;
 }

 function transferForm(address _from, address _to, uint256 _value) public returns (bool success){
   require(_value <= balanceOf[_from]); //ensure the value sender wants to use is less than or equal to balance of _from
   require(_value <= allowance[_from][msg.sender]); //msg.sender is the spender
   balanceOf[_from] -= _value;
   balanceOf[_to] += _value;
   allowance[_from][msg.sender] -= _value; 
   Transfer(_from, _to, _value);
   return true;
 }



}
