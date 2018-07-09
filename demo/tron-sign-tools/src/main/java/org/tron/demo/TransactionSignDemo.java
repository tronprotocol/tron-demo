package org.tron.demo;

import org.tron.tools.Api;
import org.tron.tools.PrivateKeyAndAddress;

public class TransactionSignDemo {

  public static void main(String[] args) {
    PrivateKeyAndAddress privateKeyAndAddress = Api.generateAddress();
    System.out.println("PrivateKey : " + privateKeyAndAddress.privateKey);
    System.out.println("Base58Address : " + privateKeyAndAddress.base58Address);
    System.out.println("HexAddress : " + privateKeyAndAddress.hexAddress);

    //jsonTransaction is return from wallet/createtransaction
    String jsonTransaction = "{\"txID\":\"111552a0dc5f846b8f69fb761f51ffdaca2627087eedda2e0e99a2e4cd2ba3cc\",\"raw_data\":{\"contract\":[{\"parameter\":{\"value\":{\"amount\":1000,\"owner_address\":\"41e552f6487585c2b58bc2c9bb4492bc1f17132cd0\",\"to_address\":\"41e9d79cc47518930bc322d9bf7cddd260a0260a8d\"},\"type_url\":\"type.googleapis.com/protocol.TransferContract\"},\"type\":\"TransferContract\"}],\"ref_block_bytes\":\"517b\",\"ref_block_hash\":\"61ff976936defbf3\",\"expiration\":1531126496867,\"timestamp\":1531133218345}}";
    String jsonTransaction1 =  Api.signTransaction("8ef7dd1a81d4ef2b538daae0c20e37f4edb3fd1338aff91b03e2b8b1ed956645", jsonTransaction);
    System.out.println(jsonTransaction1);
    //Invoke wallet/broadcasttransaction jsonTransaction1
  }
}
