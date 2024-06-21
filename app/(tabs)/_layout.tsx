import { Text } from "@gluestack-ui/themed";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        options={{
          headerShown: false,
          tabBarIcon: () => (
            <Text fontFamily="Vazirmatn_700Bold" fontSize={16}>
              رفع نسخی
            </Text>
          ),
          tabBarIconStyle: { width: "100%" },
          tabBarShowLabel: false,
        }}
        name="index"
      />
      <Tabs.Screen
        options={{
          headerShown: false,
          tabBarIcon: (props) => (
            <Text fontFamily="Vazirmatn_700Bold" fontSize={16}>
              کیف پول
            </Text>
          ),
          tabBarIconStyle: { width: "100%" },

          tabBarShowLabel: false,
        }}
        name="wallet"
      />
    </Tabs>
  );
}
