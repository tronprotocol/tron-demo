package org.tron.tools;

import org.spongycastle.util.encoders.Hex;
import org.tron.common.crypto.ECKey;
import org.tron.common.utils.JsonFormat;
import org.tron.common.utils.TransactionUtils;
import org.tron.common.utils.Utils;
import org.tron.protos.Protocol.Transaction;

public class Api {

  public static PrivateKeyAndAddress generateAddress() {
    return new PrivateKeyAndAddress();
  }

  public static String signTransaction(String hexPrivateKey, String jsonTransaction) {
    Transaction transaction = Utils.packTransaction(jsonTransaction);
    ECKey ecKey = ECKey.fromPrivate(Hex.decode(hexPrivateKey));
    transaction = TransactionUtils.sign(transaction, ecKey);
    return Utils.printTransactionJOSN(transaction);
  }
}
