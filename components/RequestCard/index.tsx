import axiosInstance from "@/lib/Instance";
import measure from "@/lib/LatLongDistance";
import OpenMap from "@/lib/OpenMap";
import { IRequest } from "@/types";
import {
  Button,
  Card,
  Pressable,
  Spinner,
  Text,
  View,
} from "@gluestack-ui/themed";
import { Position } from "@rnmapbox/maps/lib/typescript/src/types/Position";
import { Image } from "react-native";
import { Audio } from "expo-av";
import { useEffect, useState } from "react";
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
  najiLocation,
}: {
  item: IRequest;
  location?: Position;
  onAccept?: () => void;
  accepted: boolean;
  onReject?: () => void;
  onCancel?: () => void;
  onDone?: () => void;
  width?: any;
  najiLocation?: Position;
  role?: "NAJI" | "NASAKH";
}) {
  const [sound, setSound] = useState<Audio.Sound>();
  const [isPlaying, setPlaying] = useState<boolean>(false);
  useEffect(() => {
    (async () => {
      const sound = new Audio.Sound();
      sound
        .loadAsync({
          uri: `${process.env.EXPO_PUBLIC_BASE_URL}/notif.mp3`,
        })
        .then((data) => {
          sound.setPositionAsync(0);
        });
      setSound(sound);
    })();
  }, []);
  useEffect(() => {
    if (role !== "NASAKH" || item.status !== "BRINGING") {
      if (isPlaying) {
        sound?.pauseAsync().then(() =>
          sound.setPositionAsync(0).then(() => {
            setPlaying(false);
          })
        );
      }
    }
  }, [item, role]);
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
            <View
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              flexDirection="row-reverse"
            >
              <Text
                marginBottom={8}
                textAlign="right"
                fontFamily="Vazirmatn_700Bold"
              >
                {item.naji?.name}
              </Text>
              <Text fontFamily="Vazirmatn_500Medium">
                {Math.round(
                  measure(
                    najiLocation?.[1] || 0,
                    najiLocation?.[0] || 0,
                    location?.[1] || 0,
                    location?.[0] || 0
                  )
                )}{" "}
                متر
              </Text>
            </View>
            <>
              <View
                marginBottom={8}
                display="flex"
                flexDirection="row-reverse"
                alignItems="center"
              >
                <Button
                  marginHorizontal={4}
                  onPress={onDone}
                  flex={1}
                  backgroundColor="$success500"
                >
                  <Text color="$white" fontFamily="Vazirmatn_500Medium">
                    رفع نسخی
                  </Text>
                </Button>
                <Button
                  flex={1}
                  marginHorizontal={4}
                  onPress={async () => {
                    if (isPlaying) {
                      sound?.pauseAsync().then(() =>
                        sound.setPositionAsync(0).then(() => {
                          setPlaying(false);
                        })
                      );
                    } else {
                      sound?.playAsync().then(() => setPlaying(true));
                    }
                  }}
                  backgroundColor="$black"
                >
                  <Text color="$white" fontFamily="Vazirmatn_500Medium">
                    {!isPlaying ? "پخش صدا" : "قطعش کن"}
                  </Text>
                </Button>
              </View>
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
              ).toLocaleString("fa-ir")}{" "}
              متر
            </Text>
          </View>
          <Text
            marginBottom={8}
            fontSize={14}
            fontFamily="Vazirmatn_400Regular"
          >
            <Text textAlign="right" fontFamily="Vazirmatn_700Bold">
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
