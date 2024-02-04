import { Card, ScrollView, Text, View } from "@gluestack-ui/themed";
import { FlatList } from "react-native";

export default function HomePage() {
  return (
    <FlatList
      ListHeaderComponent={() => (
        <View>
          <Text fontFamily="Vazirmatn_900Black" fontSize={16}>
            نسخ های نزدیک شما
          </Text>
        </View>
      )}
      ListHeaderComponentStyle={{ marginBottom: 16 }}
      contentContainerStyle={{ padding: 16 }}
      ItemSeparatorComponent={() => <View height={16}></View>}
      data={[
        {
          name: "محمد خردادیان",
          distance: 1,
          cigarrets: 5,
          description: "حاجی خیلی نسخم ناموسا قبول کن پاره شدم",
        },
      ]}
      renderItem={({ item, index }) => (
        <Card key={index}>
          <View
            justifyContent="space-between"
            alignItems="center"
            display="flex"
            flexDirection="row-reverse"
            marginBottom={16}
          >
            <Text fontFamily="Vazirmatn_900Black">{item.name}</Text>
            <Text fontSize={14} fontFamily="Vazirmatn_300Light">
              {item.distance.toLocaleString("fa-ir")} کیلومتر
            </Text>
          </View>

          <Text marginBottom={16} fontFamily="Vazirmatn_900Black">
            تعداد:{" "}
            <Text fontFamily="Vazirmatn_400Regular">
              {item.cigarrets.toLocaleString("fa-ir")} نخ
            </Text>
          </Text>
          <Text marginBottom={4} fontFamily="Vazirmatn_900Black">
            توضیحات:
          </Text>
          <Text fontSize={14} fontFamily="Vazirmatn_400Regular">
            {item.description}
          </Text>
        </Card>
      )}
    />
  );
}
