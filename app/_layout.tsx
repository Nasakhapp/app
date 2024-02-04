import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import LogoIcon from "@/assets/images/Nasakh.svg";
import { useFonts } from "expo-font";
import { useCallback, useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { GluestackUIProvider } from "@gluestack-ui/themed";
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

Mapbox.setAccessToken(
  "pk.eyJ1IjoiaHZtaWRyZXhhIiwiYSI6ImNsaHBhNHlnOTA1MHQzaW9iODhyMzFmNzkifQ.V_8EC5aNqfIqzM4pACfXlw"
);

export default function HomeLayout() {
  const [location, setLocation] = useState<Location.LocationObject>();
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

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (location && (fontsLoaded || fontError)) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError && !location) {
    return null;
  }

  return (
    <GluestackUIProvider config={config}>
      <View
        style={{ width: "100%", height: "100%" }}
        onLayout={onLayoutRootView}
      >
        <Tabs
          initialRouteName="requests"
          screenOptions={{
            headerTitleAlign: "center",
            headerTitle: () => <LogoIcon width={70} height={9} />,
            headerBackground: () => null,
            tabBarLabelStyle: {
              fontSize: 0,
            },
          }}
        >
          <Tabs.Screen
            name="requests"
            options={{
              tabBarLabel: "",
              tabBarIcon: () => (
                <FontAwesome6 name={"hand-holding-hand"} size={24} />
              ),
            }}
          />
          <Tabs.Screen
            name="my-requests"
            options={{
              tabBarLabel: "",
              tabBarIcon: () => (
                <FontAwesome6 name={"hand-holding"} size={24} />
              ),
            }}
          />
        </Tabs>
      </View>
    </GluestackUIProvider>
  );
}
