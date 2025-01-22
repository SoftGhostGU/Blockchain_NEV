var GoodsDelivery = artifacts.require("../contracts/GoodsDelivery");

module.exports = function(deployer) {
  deployer.deploy(GoodsDelivery);
};