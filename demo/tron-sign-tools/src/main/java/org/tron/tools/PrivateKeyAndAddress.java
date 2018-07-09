package org.tron.tools;

import org.apache.commons.codec.binary.Hex;
import org.tron.common.crypto.ECKey;
import org.tron.common.utils.Utils;
import org.tron.common.utils.Wallet;

public class PrivateKeyAndAddress {
  public String privateKey;
  public String base58Address;
  public String hexAddress;

  public PrivateKeyAndAddress(){
    ECKey ecKey = new ECKey(Utils.getRandom());
    byte[] priKey = ecKey.getPrivKeyBytes();
    byte[] address = ecKey.getAddress();
    privateKey = Hex.encodeHexString(priKey);
    hexAddress = Hex.encodeHexString(address);
    base58Address = Wallet.encode58Check(address);
  }
}
