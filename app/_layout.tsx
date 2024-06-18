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

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "web") return "noToken";

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas.projectId,
    });
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return token?.data;
}

export default function HomeLayout() {
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
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();

  const [activeRequest, setActiveRequest] = useState<{
    request?: IRequest;
    role?: "NAJI" | "NASAKH";
  }>({});

  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (error) {
      // You can also add an alert() to see the error message in case of an error when fetching updates.
    }
  }
  useEffect(() => {
    registerForPushNotificationsAsync().then((pushToken) => {
      setExpoPushToken(pushToken);
      onFetchUpdateAsync().then(() => {
        Location.requestForegroundPermissionsAsync().then((data) => {
          setLocationPermission(data.status === "granted");
        });
      });
      AsyncStorage.getItem("token").then((token) => {
        if (!token) {
          axiosInstance.get("/token").then((data) => {
            const user = data.data;
            AsyncStorage.setItem("token", user.token);
            setUser(user);
          });
        } else {
          axiosInstance
            .get("/me", {
              headers: { Authorization: "Bearer " + token },
            })
            .then((data) => {
              setUser({ ...data.data, token });
              if (data.data.UserAsNajiRequests.length > 0) {
                setActiveRequest({
                  request: data.data.UserAsNajiRequests?.[0],
                  role: "NAJI",
                });
              }
              if (data.data.UserAsNasakhRequests.length > 0) {
                setActiveRequest({
                  request: data.data.UserAsNasakhRequests?.[0],
                  role: "NASAKH",
                });
              }
            });
        }
        if (Platform.OS !== "web")
          axiosInstance.patch(
            "push-token",
            { pushToken },
            {
              headers: {
                Authorization: "Bearer " + token,
              },
            }
          );
      });
    });

    return () => {
      socket.disconnect();
      socket.removeAllListeners();
    };
  }, []);
  useEffect(() => {
    if (user.token)
      Location.getCurrentPositionAsync({}).then((resp) => {
        setLocation([resp.coords.longitude, resp.coords.latitude]);
        axiosInstance
          .get(
            `/near-nasakhs?lat=${resp.coords.latitude}&long=${resp.coords.longitude}`,
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
      location?.[1] &&
      expoPushToken
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
                <View width="100%" height="100%" onLayout={onLayoutRootView}>
                  <Stack
                    screenOptions={{
                      headerTitle: () => {
                        return <Text />;
                      },
                      headerLeft: () => (
                        <LogoIcon
                          style={{ marginLeft: Platform.OS === "web" ? 16 : 0 }}
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
                          gap={16}
                        >
                          <Text
                            marginRight={Platform.OS === "web" ? 16 : 0}
                            fontFamily="Vazirmatn_700Bold"
                          >
                            نام: {user.name}
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
