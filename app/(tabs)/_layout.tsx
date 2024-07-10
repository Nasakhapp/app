import { Text } from "@gluestack-ui/themed";
import { Tabs } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { DrawerActions } from "@react-navigation/native";
import { useWindowDimensions } from "react-native";

export default function TabLayout() {
  const { width } = useWindowDimensions();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          drawerPosition: "right",
          drawerActiveBackgroundColor: "#F7941D55",
          drawerStyle: { backgroundColor: "rgb(242, 242, 242)" },
        }}
      >
        <Drawer.Screen
          options={{
            headerShown: false,
            drawerLabel: () => (
              <Text fontFamily="Vazirmatn_700Bold" fontSize={14}>
                رفع نسخی
              </Text>
            ),
          }}
          name="index"
        />

        <Drawer.Screen
          options={{
            headerShown: false,
            drawerLabel: (props) => (
              <Text fontFamily="Vazirmatn_700Bold" fontSize={14}>
                هم‌کام
              </Text>
            ),

            unmountOnBlur: true,
          }}
          name="hamkaam"
        />

        <Drawer.Screen
          options={{
            headerShown: false,
            drawerLabel: (props) => (
              <Text fontFamily="Vazirmatn_700Bold" fontSize={14}>
                کام‌نامه
              </Text>
            ),

            unmountOnBlur: true,
          }}
          name="kaamnaameh"
        />

        <Drawer.Screen
          options={{
            headerShown: false,
            drawerLabel: (props) => (
              <Text fontFamily="Vazirmatn_700Bold" fontSize={14}>
                قلک
              </Text>
            ),

            unmountOnBlur: true,
          }}
          name="ghollak"
        />
        <Drawer.Screen
          options={{
            headerShown: false,
            drawerLabel: (props) => (
              <Text fontFamily="Vazirmatn_700Bold" fontSize={14}>
                دکه
              </Text>
            ),
          }}
          name="dakke"
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
