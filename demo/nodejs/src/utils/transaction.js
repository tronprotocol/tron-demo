const decode58Check = require("./crypto").decode58Check;
const {Transaction} = require("../protocol/core/Tron_pb");
const google_protobuf_any_pb = require('google-protobuf/google/protobuf/any_pb.js');
const {FreezeBalanceContract, UnfreezeBalanceContract, WitnessCreateContract} = require("../protocol/core/Contract_pb");
const base64DecodeFromString = require("../lib/code").base64DecodeFromString;

function encodeString(str) {
  return Uint8Array.from(base64DecodeFromString(btoa(str)));
}

function buildTransferContract(message, contractType, typeName) {
  var anyValue = new google_protobuf_any_pb.Any();
  anyValue.pack(message.serializeBinary(), "protocol." + typeName);

  var contract = new Transaction.Contract();
  contract.setType(contractType);
  contract.setParameter(anyValue);

  var raw = new Transaction.raw();
  raw.addContract(contract);
  raw.setTimestamp(new Date().getTime() * 1000000);

  var transaction = new Transaction();
  transaction.setRawData(raw);

  return transaction;
}

/**
 * Freeze balance
 *
 * @param address From which address to freze
 * @param amount The amount of TRX to freeze
 * @param duration Duration in days
 */
function buildFreezeBalance(address, amount, duration) {
  var contract = new FreezeBalanceContract();

  contract.setOwnerAddress(Uint8Array.from(decode58Check(address)));
  contract.setFrozenBalance(amount);
  contract.setFrozenDuration(duration);

  return buildTransferContract(
    contract,
    Transaction.Contract.ContractType.FREEZEBALANCECONTRACT,
    "FreezeBalanceContract");
}

/**
 * Unfreeze balance
 *
 * @param address From which address to freze
 */
function buildUnfreezeBalance(address) {
  var contract = new UnfreezeBalanceContract();

  contract.setOwnerAddress(Uint8Array.from(decode58Check(address)));

  return buildTransferContract(
    contract,
    Transaction.Contract.ContractType.UNFREEZEBALANCECONTRACT,
    "UnfreezeBalanceContract");
}

/**
 * Unfreeze balance
 *
 * @param address From which address to freze
 * @param url url
 */
function buildApplyForDelegate(address, url) {
  var contract = new WitnessCreateContract();

  contract.setOwnerAddress(Uint8Array.from(decode58Check(address)));
  contract.setUrl(encodeString(url));

  return buildTransferContract(
    contract,
    Transaction.Contract.ContractType.WITNESSCREATECONTRACT,
    "WitnessCreateContract");
}

module.exports = {
  buildFreezeBalance,
  buildUnfreezeBalance,
  buildApplyForDelegate,
};
