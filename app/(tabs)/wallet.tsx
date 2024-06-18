import { Text, View } from "@gluestack-ui/themed";
import { TonConnectButton, useTonWallet } from "@tonconnect/ui-react";
import { useEffect, useState } from "react";

export default function WalletPage() {
  const wallet = useTonWallet();

  const [balance, setBalance] = useState<string>();
  useEffect(() => {
    console.log(wallet);
  }, [wallet]);
  return (
    <View
      w={"$full"}
      h={"$full"}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {wallet ? <View>{balance}</View> : <TonConnectButton />}
    </View>
  );
}
