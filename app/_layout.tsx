import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import {
  Vazirmatn_100Thin,
  Vazirmatn_200ExtraLight,
  Vazirmatn_300Light,
  Vazirmatn_400Regular,
  Vazirmatn_500Medium,
  Vazirmatn_600SemiBold,
  Vazirmatn_700Bold,
  Vazirmatn_800ExtraBold,
  Vazirmatn_900Black,
} from "@expo-google-fonts/vazirmatn";
import { config } from "@gluestack-ui/config"; // Optional if you want to use default theme
import {
  Box,
  Button,
  GluestackUIProvider,
  Text,
  View,
} from "@gluestack-ui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Position } from "@rnmapbox/maps/lib/typescript/src/types/Position";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { useFonts } from "expo-font";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { Stack, Tabs } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Updates from "expo-updates";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import io from "socket.io-client";

import LogoIcon from "@/assets/images/Nasakh.svg";
import {
  LocationContext,
  RequestContext,
  RequestsContext,
  UserContext,
} from "@/components/Contexts/Contexts";
import axiosInstance from "@/lib/Instance";
import measure from "@/lib/LatLongDistance";
import socket from "@/lib/socket";
import { IRequest, IUser } from "@/types";
import { TonConnectButton, TonConnectUIProvider } from "@tonconnect/ui-react";
import {
  retrieveLaunchParams,
  SDKProvider,
  useCloudStorage,
  useInitData,
  useInitDataRaw,
  useLaunchParams,
} from "@tma.js/sdk-react";
import { AxiosHeaders } from "axios";

import "./mockEnv";
import { DrawerToggleButton } from "@react-navigation/drawer";

function Root() {
  const [fontsLoaded, fontError] = useFonts({
    Vazirmatn_200ExtraLight,
    Vazirmatn_300Light,
    Vazirmatn_400Regular,
    Vazirmatn_500Medium,
    Vazirmatn_600SemiBold,
    Vazirmatn_700Bold,
    Vazirmatn_800ExtraBold,
    Vazirmatn_900Black,
  });
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [user, setUser] = useState<IUser>({});
  const [requests, setRequests] = useState<IRequest[]>([]);
  const [location, setLocation] = useState<Position>();
  const [isConnected, setConnected] = useState<boolean>(false);
  const { initDataRaw, initData } = useLaunchParams();
  const cloudStorage = useCloudStorage();
  const [activeRequest, setActiveRequest] = useState<{
    request?: IRequest;
    role?: "NAJI" | "NASAKH";
  }>({});

  function Auth() {
    axiosInstance
      .post(
        "/token",
        {},
        {
          headers: {
            "telegram-data": initDataRaw,
          },
        }
      )
      .then((data) => {
        const user = data.data;
        process.env.NODE_ENV === "development"
          ? AsyncStorage.setItem("token", user.token)
          : cloudStorage.set("token", user.token);
        setUser(user);
        if (user.UserAsNajiRequests.length > 0) {
          setActiveRequest({
            request: user.UserAsNajiRequests?.[0],
            role: "NAJI",
          });
        }
        if (user.UserAsNasakhRequests.length > 0) {
          setActiveRequest({
            request: user.UserAsNasakhRequests?.[0],
            role: "NASAKH",
          });
        }
        if (
          initData?.chat?.id &&
          (!user.telegramChatId || user?.telegramChatId !== initData.chat.id)
        ) {
          axiosInstance.put(
            "/me/telegram-chat-id",
            { telegramChatId: initData.chat.id },
            { headers: { Authorization: "Bearer " + user.token } }
          );
        }
      });
  }

  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then((data) => {
      setLocationPermission(data.status === "granted");
    });
    Auth();
    return () => {
      socket.disconnect();
      socket.removeAllListeners();
    };
  }, [initDataRaw]);
  useEffect(() => {
    if (user.token)
      Location.getCurrentPositionAsync({}).then((resp) => {
        setLocation([resp.coords.longitude, resp.coords.latitude]);
        axiosInstance
          .get(
            `/nasakh/near?lat=${resp.coords.latitude}&long=${resp.coords.longitude}`,
            { headers: { Authorization: "Bearer " + user.token } }
          )
          .then((data) => {
            setRequests(data.data);
          })
          .catch((err) => console.log(err));
      });
  }, [user]);
  useEffect(() => {
    socket.on("connect", () => {
      console.log("connect to socket");
      setConnected(true);
    });
    socket.on("disconnect", (reason) => {
      socket.connect();
    });
  }, [socket]);

  useEffect(() => {
    socket.on("add-nasakh", (request: IRequest) => {
      if (
        !requests.includes(request) &&
        request.nasakh.id !== user?.id &&
        location &&
        measure(request.lat, request.long, location?.[1], location?.[0]) < 300
      ) {
        setRequests([request, ...requests]);
      }
    });
    socket.on("remove-nasakh", ({ id }: { id: string }) => {
      const newRequests = requests.filter((item) => item.id !== id);
      setRequests(newRequests);
    });

    return () => {
      socket.off("remove-nasakh");
      socket.off("add-nasakh");
    };
  }, [requests]);

  useEffect(() => {
    socket.on(
      user.id || "",
      (data: { request?: IRequest; role?: "NAJI" | "NASAKH" }) => {
        setActiveRequest?.(data);
      }
    );

    return () => {
      socket.off(user.id);
    };
  }, [user, activeRequest]);

  const onLayoutRootView = useCallback(async () => {
    if (
      locationPermission &&
      (fontsLoaded || fontError) &&
      user.token &&
      isConnected &&
      location?.[0] &&
      location?.[1]
    ) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, locationPermission, user.token]);

  if (!fontsLoaded && !fontError && !locationPermission) {
    return null;
  }
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <RequestContext.Provider value={{ activeRequest, setActiveRequest }}>
        <RequestsContext.Provider value={{ requests, setRequests }}>
          <LocationContext.Provider value={{ location, setLocation }}>
            <GluestackUIProvider config={config}>
              <TonConnectUIProvider
                manifestUrl={`${window.location.origin}/tonconnect-manifest.json`}
              >
                <View width={"100%"} height="100%" onLayout={onLayoutRootView}>
                  <Stack
                    screenOptions={{
                      headerTitle: () => {
                        return <Text />;
                      },
                      headerLeft: () => (
                        <LogoIcon
                          style={{
                            marginLeft: Platform.OS === "web" ? 16 : 0,
                          }}
                          width={70}
                          height={9}
                        />
                      ),
                      headerBackground: () => null,
                      headerRight: () => (
                        <View
                          display="flex"
                          flexDirection="row-reverse"
                          alignItems="center"
                        >
                          <DrawerToggleButton />
                          <Text color="$black" fontFamily="Vazirmatn_700Bold">
                            {user.name}
                          </Text>
                        </View>
                      ),
                    }}
                  >
                    <Stack.Screen name="(tabs)" />
                  </Stack>
                </View>
              </TonConnectUIProvider>
            </GluestackUIProvider>
          </LocationContext.Provider>
        </RequestsContext.Provider>
      </RequestContext.Provider>
    </UserContext.Provider>
  );
}

export default function HomeLayout() {
  return (
    <SDKProvider>
      <Root />
    </SDKProvider>
  );
}
