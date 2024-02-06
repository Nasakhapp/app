import { Stack, Tabs } from "expo-router";
import LogoIcon from "@/assets/images/Nasakh.svg";
import { useFonts } from "expo-font";
import { useCallback, useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Button, GluestackUIProvider, Text, View } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config"; // Optional if you want to use default theme
import * as Location from "expo-location";
import Mapbox from "@rnmapbox/maps";

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
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "@/lib/Instance";
import { RequestContext, UserContext } from "@/components/Contexts/Contexts";
import { IRequest, IUser } from "@/types";
import socket from "@/lib/socket";
import * as Updates from "expo-updates";
Mapbox.setAccessToken(
  "pk.eyJ1IjoiaHZtaWRyZXhhIiwiYSI6ImNsaHBhNHlnOTA1MHQzaW9iODhyMzFmNzkifQ.V_8EC5aNqfIqzM4pACfXlw"
);

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
      alert(`Error fetching latest Expo update: ${error}`);
    }
  }
  useEffect(() => {
    onFetchUpdateAsync().then(() => {
      Location.requestForegroundPermissionsAsync().then((data) => {
        setLocationPermission(data.status === "granted");
        if (data.status !== "granted") return;
        AsyncStorage.getItem("token").then((token) => {
          if (!token) {
            axiosInstance.get("/new-user").then((data) => {
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
                    request: data.data.UserAsNajiRequests[0],
                    role: "NAJI",
                  });
                }
                if (data.data.UserAsNasakhRequests.length > 0) {
                  setActiveRequest({
                    request: data.data.UserAsNasakhRequests[0],
                    role: "NASAKH",
                  });
                }
              });
          }
        });
      });
    });
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (locationPermission && (fontsLoaded || fontError) && user.token) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, locationPermission, user.token]);

  if (!fontsLoaded && !fontError && !locationPermission) {
    return null;
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <RequestContext.Provider value={{ activeRequest, setActiveRequest }}>
        <GluestackUIProvider config={config}>
          <View width={"100%"} height={"100%"} onLayout={onLayoutRootView}>
            <Stack
              screenOptions={{
                headerTitleAlign: "left",
                headerTitle: () => <LogoIcon width={70} height={9} />,
                headerBackground: () => null,
                headerRight: () => (
                  <Text fontFamily="Vazirmatn_700Bold">نام: {user.name}</Text>
                ),
              }}
            >
              <Stack.Screen name="index" />
            </Stack>
          </View>
        </GluestackUIProvider>
      </RequestContext.Provider>
    </UserContext.Provider>
  );
}
