import { Text } from "@gluestack-ui/themed";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        options={{
          headerShown: false,
          tabBarLabel: (props) => (
            <Text fontFamily="Vazirmatn_700Bold">رفع نسخی</Text>
          ),
          tabBarIcon: () => null,
        }}
        name="index"
      />
      <Tabs.Screen
        options={{
          headerShown: false,
          tabBarLabel: (props) => (
            <Text fontFamily="Vazirmatn_700Bold">کیف پول</Text>
          ),
          tabBarIcon: () => null,
        }}
        name="wallet"
      />
    </Tabs>
  );
}
