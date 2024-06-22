import { UserContext } from "@/components/Contexts/Contexts";
import axiosInstance from "@/lib/Instance";
import {
  Avatar,
  AvatarImage,
  Button,
  Divider,
  Icon,
  Image,
  InfoIcon,
  MenuIcon,
  Pressable,
  Progress,
  ProgressFilledTrack,
  Spinner,
  Text,
  View,
} from "@gluestack-ui/themed";
import {
  TonConnectButton,
  useTonAddress,
  useTonWallet,
} from "@tonconnect/ui-react";
import { useFocusEffect, useNavigation } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";

export default function WalletPage() {
  const walletAddress = useTonAddress();
  const { user, setUser } = useContext(UserContext);
  const [wallet, setWallet] = useState<{
    balance: string;
    jetton: {
      description: string;
      image: string;
      name: string;
      symbol: string;
    };
  }>();
  const [point, setPoint] = useState<{
    point: number;
    level: { name: string; min: number; max: number };
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
          setWallet(res.data);
        });
    }
  }, [user?.walletAddress]);
  useEffect(() => {
    if (user?.token)
      axiosInstance
        .get("/me/level", {
          headers: { Authorization: "Bearer " + user?.token },
        })
        .then((res) => {
          setPoint(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
  }, [user]);
  return (
    <View
      paddingHorizontal={16}
      w="$full"
      h="$full"
      display="flex"
      alignItems="center"
      gap={4}
    >
      {user?.walletAddress ? (
        <View display="flex" gap={8} w="$full">
          <Text fontFamily="Vazirmatn_900Black" fontSize={"$lg"}>
            قلک
          </Text>
          {wallet ? (
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
                  source={{ uri: wallet?.jetton.image }}
                  rounded="$full"
                  size="sm"
                />
                <View display="flex" gap={8}>
                  <Text fontSize={"$md"} fontFamily="Vazirmatn_700Bold">
                    موجودی
                  </Text>
                  <View
                    display="flex"
                    flexDirection="row-reverse"
                    gap={4}
                    alignItems="center"
                  >
                    <Text fontFamily="Vazirmatn_700Bold" fontSize={"$xl"}>
                      {Intl.NumberFormat("fa-ir").format(
                        Number(wallet?.balance)
                      )}{" "}
                    </Text>
                    <Text fontFamily="Vazirmatn_500Medium" fontSize={"$xs"}>
                      {wallet?.jetton.symbol}
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
            <Spinner color={"#f7941d"} />
          )}
        </View>
      ) : (
        <TonConnectButton />
      )}
      <Divider marginVertical={16} />

      <View display="flex" gap={16} w="$full">
        <Text fontFamily="Vazirmatn_900Black" fontSize={"$lg"}>
          سطح: {point?.level.name}
        </Text>
        {point ? (
          <View display="flex" justifyContent="space-between" w="$full" gap={4}>
            <Progress
              size="sm"
              min={point.level.min}
              max={point.level.max}
              value={point.point}
              direction="rtl"
            >
              <ProgressFilledTrack bgColor="#f7941d" />
            </Progress>
            <View
              w={"$full"}
              display="flex"
              flexDirection="row-reverse"
              justifyContent="space-between"
              alignItems="center"
            >
              <Text fontFamily="Vazirmatn_500Medium" size="xs">
                امتیاز شما: {Intl.NumberFormat("fa-ir").format(point.point)}
              </Text>
              <Text fontFamily="Vazirmatn_500Medium" size="xs">
                امتیاز نهایی این سطح:{" "}
                {Intl.NumberFormat("fa-ir").format(point.level.max)}
              </Text>
            </View>
          </View>
        ) : (
          <Spinner color={"#f7941d"} />
        )}
      </View>
    </View>
  );
}
