import axiosInstance from "@/lib/Instance";
import measure from "@/lib/LatLongDistance";
import OpenMap from "@/lib/OpenMap";
import { IRequest } from "@/types";
import { Button, Card, Spinner, Text, View } from "@gluestack-ui/themed";
import { Position } from "@rnmapbox/maps/lib/typescript/src/types/Position";
import { Image } from "react-native";

export default function RequestCard({
  item,
  location,
  onAccept,
  accepted,
  onReject,
  width,
  role,
  onCancel,
  onDone,
}: {
  item: IRequest;
  location?: Position;
  onAccept?: () => void;
  accepted: boolean;
  onReject?: () => void;
  onCancel?: () => void;
  onDone?: () => void;
  width?: any;
  role?: "NAJI" | "NASAKH";
}) {
  return (
    <Card width={width}>
      {role === "NASAKH" ? (
        item.status === "SEARCHING" ? (
          <View display="flex" alignItems="center">
            <Spinner color={"#f7941d"} mb={24} size={"large"} />
            <Text mb={16} fontFamily="Vazirmatn_500Medium">
              درحال پیدا کردن ناجی
            </Text>
            <Button
              borderColor="$error500"
              borderStyle="solid"
              borderWidth={1}
              onPress={onCancel}
              backgroundColor={undefined}
              paddingHorizontal={64}
            >
              <Text
                color="$error500"
                textAlign="center"
                fontFamily="Vazirmatn_500Medium"
              >
                لغو
              </Text>
            </Button>
          </View>
        ) : (
          <>
            <Text marginBottom={8} fontFamily="Vazirmatn_700Bold">
              {item.naji?.name}
            </Text>
            <>
              <Button
                marginBottom={8}
                onPress={onDone}
                backgroundColor="$success500"
              >
                <Text color="$white" fontFamily="Vazirmatn_500Medium">
                  به سوی نسخ
                </Text>
              </Button>
              <Button
                borderColor="$error500"
                borderStyle="solid"
                borderWidth={1}
                onPress={onCancel}
                backgroundColor="$white"
              >
                <Text color="$error500" fontFamily="Vazirmatn_500Medium">
                  لغو
                </Text>
              </Button>
            </>
          </>
        )
      ) : (
        <>
          <View
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexDirection="row-reverse"
            marginBottom={8}
          >
            <Text fontFamily="Vazirmatn_700Bold">{item.nasakh.name}</Text>
            <Text fontFamily="Vazirmatn_500Medium">
              {Math.round(
                measure(
                  item.lat,
                  item.long,
                  location?.[1] || 0,
                  location?.[0] || 0
                )
              )}{" "}
              متر
            </Text>
          </View>
          <Text
            marginBottom={8}
            fontSize={14}
            fontFamily="Vazirmatn_400Regular"
          >
            <Text fontFamily="Vazirmatn_700Bold">
              {item.amount.toLocaleString("fa-ir")}
            </Text>{" "}
            نخ می خواد
          </Text>
          {/* <Text fontFamily="Vazirmatn_700Bold">توضیحات:</Text> */}
          {/* <Text marginBottom={12} fontSize={12} fontFamily="Vazirmatn_400Regular">
        {item.description}
      </Text> */}
          {!accepted ? (
            <Button onPress={onAccept} backgroundColor="#f7941d">
              <Text color="$white" fontFamily="Vazirmatn_500Medium">
                میبرم
              </Text>
            </Button>
          ) : (
            <>
              <Button
                marginBottom={8}
                onPress={() => {
                  OpenMap(item.long, item.lat, `به سوی ${item.nasakh.name}`);
                }}
                backgroundColor="$black"
              >
                <Text color="$white" fontFamily="Vazirmatn_500Medium">
                  به سوی نسخ
                </Text>
              </Button>
              <Button
                borderColor="$error500"
                borderStyle="solid"
                borderWidth={1}
                onPress={onReject}
                backgroundColor="$white"
              >
                <Text color="$error500" fontFamily="Vazirmatn_500Medium">
                  لغو
                </Text>
              </Button>
            </>
          )}
        </>
      )}
    </Card>
  );
}
