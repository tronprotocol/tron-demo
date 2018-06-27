const getBase58CheckAddress = require("../utils/crypto").getBase58CheckAddress;
const {Block, Transaction} = require("../protocol/core/Tron_pb");
const {TransferContract} = require("../protocol/core/Contract_pb");


function deserializeTransaction(tx) {
  let contractType = Transaction.Contract.ContractType;

  let contractList = tx.getRawData().getContractList();

  let transactions = [];

  for (let contract of contractList) {
    let any = contract.getParameter();

    switch (contract.getType()) {

      case contractType.ACCOUNTCREATECONTRACT: {
        // contractType = contractType .ACCOUNTCREATECONTRACT;

        let obje = any.unpack(AccountCreateContract.deserializeBinary, "protocol.AccountCreateContract");

        transactions.push({});
      }
        break;

      case contractType .TRANSFERCONTRACT: {
        // let contractType = contractType .TRANSFERCONTRACT;

        let obje = any.unpack(TransferContract.deserializeBinary, "protocol.TransferContract");

        let owner = obje.getOwnerAddress();
        let ownerHex = getBase58CheckAddress(Array.from(owner));

        let to = obje.getToAddress();
        let toHex = getBase58CheckAddress(Array.from(to));

        let amount = obje.getAmount() / 1000000;

        transactions.push({
          from: ownerHex,
          to: toHex,
          amount,
        });
      }
      break;
    }

  }

  return transactions;
}

module.exports = {
  deserializeTransaction
};
