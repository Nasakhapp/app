import { Text } from "@gluestack-ui/themed";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        options={{
          headerShown: false,
          tabBarIcon: (props) => (
            <Text fontFamily="Vazirmatn_700Bold" fontSize={14}>
              دکه
            </Text>
          ),
          tabBarIconStyle: { width: "100%" },

          tabBarShowLabel: false,
        }}
        name="shop"
      />

      <Tabs.Screen
        options={{
          headerShown: false,
          tabBarIcon: (props) => (
            <Text fontFamily="Vazirmatn_700Bold" fontSize={14}>
              پول مفت
            </Text>
          ),
          tabBarIconStyle: { width: "100%" },

          tabBarShowLabel: false,
          unmountOnBlur: true,
        }}
        name="wallet"
      />
      <Tabs.Screen
        options={{
          headerShown: false,
          tabBarIcon: (props) => (
            <Text fontFamily="Vazirmatn_700Bold" fontSize={14}>
              هم‌کام
            </Text>
          ),
          tabBarIconStyle: { width: "100%" },

          tabBarShowLabel: false,
        }}
        name="mate"
      />
      <Tabs.Screen
        options={{
          headerShown: false,
          tabBarIcon: () => (
            <Text fontFamily="Vazirmatn_700Bold" fontSize={14}>
              رفع نسخی
            </Text>
          ),
          tabBarIconStyle: { width: "100%" },
          tabBarShowLabel: false,
        }}
        name="index"
      />
    </Tabs>
  );
}
