var MedicalTreatment = artifacts.require("MedicalTreatment");

module.exports = function(deployer) {
  deployer.deploy(MedicalTreatment);
};