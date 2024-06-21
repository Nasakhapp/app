import { UserContext } from "@/components/Contexts/Contexts";
import axiosInstance from "@/lib/Instance";
import {
  Avatar,
  AvatarImage,
  Button,
  Icon,
  Image,
  InfoIcon,
  MenuIcon,
  Pressable,
  Text,
  View,
} from "@gluestack-ui/themed";
import {
  TonConnectButton,
  useTonAddress,
  useTonWallet,
} from "@tonconnect/ui-react";
import { useContext, useEffect, useState } from "react";

export default function WalletPage() {
  const walletAddress = useTonAddress();
  const { user, setUser } = useContext(UserContext);
  const [balance, setBalance] = useState<{
    balance: string;
    jetton: {
      description: string;
      image: string;
      name: string;
      symbol: string;
    };
  }>();
  useEffect(() => {
    if (
      (!user?.walletAddress || user?.walletAddress === "") &&
      walletAddress &&
      walletAddress !== ""
    ) {
      axiosInstance
        .put(
          "/me/wallet-address",
          { walletAddress },
          { headers: { Authorization: "Bearer " + user?.token } }
        )
        .then((res) => {
          setUser?.({ ...res.data });
        })
        .catch((err) => {
          if (err.response.status === 403) setUser?.({ ...err.response.data });
        });
    }
  }, [walletAddress]);
  useEffect(() => {
    if (user?.walletAddress) {
      axiosInstance
        .get("/me/wallet/", {
          headers: { Authorization: "Bearer " + user?.token },
        })
        .then((res) => {
          setBalance(res.data);
        });
    }
  }, [user?.walletAddress]);
  return (
    <View
      paddingHorizontal={16}
      w="$full"
      h="$full"
      display="flex"
      alignItems="center"
    >
      {user?.walletAddress ? (
        <View
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          w="$full"
          flexDirection="row-reverse"
        >
          <View
            display="flex"
            flexDirection="row-reverse"
            alignItems="center"
            gap={8}
          >
            <Image
              source={{ uri: balance?.jetton.image }}
              rounded="$full"
              size="sm"
            />
            <View display="flex" gap={8}>
              <Text fontSize={"$md"} fontFamily="Vazirmatn_500Medium">
                موجودی
              </Text>
              <View
                display="flex"
                flexDirection="row-reverse"
                gap={4}
                alignItems="center"
              >
                <Text fontFamily="Vazirmatn_700Bold" fontSize={"$xl"}>
                  {Intl.NumberFormat("fa-ir").format(Number(balance?.balance))}{" "}
                </Text>
                <Text fontFamily="Vazirmatn_500Medium" fontSize={"$xs"}>
                  {balance?.jetton.symbol}
                </Text>
              </View>
            </View>
          </View>
          <View>
            <Pressable>
              <Icon as={InfoIcon} />
            </Pressable>
          </View>
        </View>
      ) : (
        <TonConnectButton />
      )}
    </View>
  );
}
