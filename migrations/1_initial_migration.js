//intial migration will run when deploying, allows you to change state of database you are working on
var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
