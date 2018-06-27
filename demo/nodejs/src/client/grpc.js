
const {EmptyMessage, NumberMessage} = require("../protocol/api/api_pb");
const { TransferContract } = require("../protocol/core/Contract_pb");
const PrivateKeySigner = require("../signer/privateKeySigner");
const decode58Check = require("../utils/crypto").decode58Check;

class GrpcClient {

  constructor(options) {
    this.hostname = options.hostname;
    this.port = options.port;

    const {WalletClient} = require("../protocol/api/api_grpc_pb");
    const caller = require('grpc-caller');

    /**
     * @type {WalletClient}
     */
    this.api = caller(`${this.hostname}:${this.port}`, WalletClient);
  }

  /**
   * Retrieve all connected witnesses
   *
   * @returns {Promise<*>}
   */
  async getWitnesses() {
    return await this.api.listWitnesses(new EmptyMessage())
      .then(x => x.getWitnessesList());
  }

  /**
   * Retrieve all connected nodes
   *
   * @returns {Promise<*>}
   */
  async getNodes() {
    return await this.api.listNodes(new EmptyMessage())
      .then(x => x.getNodesList());
  }

  /**
   * Retrieves a block by the given number
   *
   * @param {number} number block number
   * @returns {Promise<*>}
   */
  async getBlockByNumber(number) {
    let message = new NumberMessage();
    message.setNum(number);
    return await this.api.getBlockByNum(message);
  }
    /**
     * 转账
     * Retrieves a TransferContract
     * @param {TransferContract}
     * @returns {Promise<*>}
     */
  async transferAccount(){
      let transferContract = new TransferContract();
      const from = 'TR9Dy1HsPrghpGdATCiz86maFDWAWTtLqe';
      const to = 'TQVd93A5mH3EkigiFn1b7BAv5tfRqtQqvh';
      const amount = 2;
      transferContract.setOwnerAddress(Uint8Array.from(decode58Check(from)));
      transferContract.setToAddress(Uint8Array.from(decode58Check(to)));
      transferContract.setAmount(amount);
      let transaction = await this.api.createTransaction(transferContract);
      //sign
      const private_key = '393B5666AB837362E36A1E1E05AB495BBF63224A976ABC04A02D7366745F99F6';
      const privateKeySigner = new PrivateKeySigner(private_key);
      let returnTransaction = await privateKeySigner.signTransaction(transaction);
      return await this.api.broadcastTransaction(returnTransaction.transaction);
  }
}

module.exports = GrpcClient;
