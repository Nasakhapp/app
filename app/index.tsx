import {
  Button,
  Card,
  Input,
  InputField,
  Modal,
  ScrollView,
  Spinner,
  Text,
  View,
} from "@gluestack-ui/themed";
import {
  Camera,
  MapView,
  PointAnnotation,
  ShapeSource,
  UserLocation,
  UserTrackingMode,
} from "@rnmapbox/maps";
import { LocationObject } from "expo-location";
import { createRef, useContext, useEffect, useState } from "react";
import { Dimensions, FlatList } from "react-native";
import * as Location from "expo-location";
import Carousel from "react-native-snap-carousel";
import measure from "@/lib/LatLongDistance";
import LogoIcon from "@/assets/images/Nasakh.svg";
import { CameraRef } from "@rnmapbox/maps/lib/typescript/src/components/Camera";
import RequestCard from "@/components/RequestCard";
import { FontAwesome6 } from "@expo/vector-icons";
import { Link, Navigator, useNavigation } from "expo-router";
import { IRequest } from "@/types";
import socket from "@/lib/socket";
import axios from "axios";
import axiosInstance from "@/lib/Instance";
import {
  RequestContext,
  RequestsContext,
  UserContext,
} from "@/components/Contexts/Contexts";
import { Position } from "@rnmapbox/maps/lib/typescript/src/types/Position";

export default function HomePage() {
  const [focus, setFocus] = useState<number>(0);
  const camera = createRef<CameraRef>();
  const slider = createRef<Carousel<any>>();
  const { activeRequest, setActiveRequest } = useContext(RequestContext);
  const [location, setLocation] = useState<Position>([]);
  const { requests, setRequests } = useContext(RequestsContext);
  const { setUser, user } = useContext(UserContext);
  const [amount, setAmount] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);
  const [najiLocation, setNajiLocation] = useState<Position>([0, 0]);

  useEffect(() => {
    Location.getCurrentPositionAsync({}).then((resp) => {
      setLocation([resp.coords.longitude, resp.coords.latitude]);
    });
  }, []);

  useEffect(() => {
    if (requests && requests[focus])
      camera.current?.setCamera({
        zoomLevel: 16,
        centerCoordinate: [requests?.[focus].long, requests?.[focus].lat],
        animationDuration: 2000,
        animationMode: "flyTo",
      });
  }, [focus]);

  useEffect(() => {
    if (
      activeRequest?.role === "NAJI" &&
      activeRequest.request &&
      activeRequest.request.status === "BRINGING"
    )
      socket.emit(activeRequest.request?.id, location);
  }, [location, activeRequest]);

  useEffect(() => {
    if (
      activeRequest?.role === "NASAKH" &&
      activeRequest.request &&
      activeRequest.request.status === "BRINGING"
    ) {
      socket.on(activeRequest.request.id, (newNajiLocation: Position) => {
        setNajiLocation(newNajiLocation);
      });
    } else if (
      activeRequest?.role === "NASAKH" &&
      activeRequest.request &&
      activeRequest.request.status !== "BRINGING"
    )
      socket.off(activeRequest.request.id, (newNajiLocation: Position) => {
        setNajiLocation(newNajiLocation);
      });

    return () => {
      socket.off(activeRequest?.request?.id);
    };
  }, [activeRequest]);

  useEffect(() => {
    if (activeRequest?.request)
      if (
        activeRequest?.role === "NASAKH" &&
        activeRequest.request.status === "BRINGING"
      )
        camera.current?.fitBounds(najiLocation, location, 40);
      else if (activeRequest?.role === "NAJI")
        camera.current?.fitBounds(
          location,
          [activeRequest?.request?.long, activeRequest?.request?.lat],
          40,
          1000
        );
      else if (
        activeRequest?.role === "NASAKH" &&
        activeRequest.request.status === "SEARCHING"
      )
        camera.current?.setCamera({
          zoomLevel: 16,
          centerCoordinate: location,
          animationDuration: 2000,
          animationMode: "flyTo",
        });
  }, [activeRequest?.role, location, najiLocation]);

  if (!user?.token)
    return (
      <View
        width={"100%"}
        height={"100%"}
        position="relative"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner />
      </View>
    );
  return (
    <View width={"100%"} height={"100%"} position="relative">
      <MapView
        zoomEnabled
        logoEnabled={false}
        scrollEnabled={!activeRequest?.role}
        scaleBarEnabled={false}
        attributionEnabled={false}
        style={{ flex: 1 }}
      >
        {!activeRequest?.request ? (
          requests?.map((item) => (
            <PointAnnotation
              coordinate={[item.long || 0, item.lat || 0]}
              key={`marker-${item.id}`}
              id={`marker-${item.id}`}
            >
              <Card>
                <LogoIcon width={50} height={6} />
              </Card>
            </PointAnnotation>
          ))
        ) : activeRequest.role === "NAJI" ? (
          <PointAnnotation
            coordinate={[
              activeRequest.request.long || 0,
              activeRequest.request.lat || 0,
            ]}
            key={`marker-${activeRequest.request.id}`}
            id={`marker-${activeRequest.request.id}`}
          >
            <Card>
              <LogoIcon width={50} height={6} />
            </Card>
          </PointAnnotation>
        ) : activeRequest?.request.status === "BRINGING" ? (
          <PointAnnotation
            coordinate={najiLocation}
            key={`marker-${activeRequest.request.id}`}
            id={`marker-${activeRequest.request.id}`}
          >
            <Card>
              <Text fontFamily="Vazirmatn_500Medium">ناجی</Text>
            </Card>
          </PointAnnotation>
        ) : null}
        <UserLocation
          onUpdate={(newLocation) =>
            setLocation([
              newLocation.coords.longitude,
              newLocation.coords.latitude,
            ])
          }
        />
        <Camera ref={camera} />
      </MapView>
      {!activeRequest?.role ? (
        <Button
          position="absolute"
          top={16}
          right={16}
          backgroundColor={"$black"}
          onPress={() => setOpen(true)}
        >
          <FontAwesome6 name="hand-scissors" size={24} color="#fff" />
        </Button>
      ) : null}
      <View
        bottom={16}
        position="absolute"
        width={"100%"}
        display="flex"
        alignItems="center"
      >
        {activeRequest?.role ? (
          <RequestCard
            accepted={activeRequest.role === "NAJI"}
            item={activeRequest.request!}
            location={location}
            role={activeRequest.role}
            onDone={() => {
              axiosInstance.get(`/request/${activeRequest.request?.id}/done`, {
                headers: { Authorization: "Bearer " + user?.token },
              });
            }}
            onReject={() => {
              axiosInstance.get(
                `/request/${activeRequest.request?.id}/reject`,
                {
                  headers: { Authorization: "Bearer " + user?.token },
                }
              );
            }}
            onCancel={() =>
              axiosInstance.get(
                `/request/${activeRequest.request?.id}/cancel`,
                {
                  headers: { Authorization: "Bearer " + user?.token },
                }
              )
            }
            width={Dimensions.get("screen").width * 0.7}
          />
        ) : (
          <>
            <Text
              fontFamily="Vazirmatn_700Bold"
              marginBottom={12}
              marginRight={16}
            >
              نسخ های نزدیک شما:
            </Text>
            {requests?.length && requests?.length > 0 ? (
              <Carousel
                onSnapToItem={(index) => setFocus(index)}
                sliderWidth={Dimensions.get("screen").width}
                itemWidth={Dimensions.get("screen").width * 0.7}
                data={request}
                ref={slider}
                renderItem={({ item }) => (
                  <RequestCard
                    item={item}
                    location={location}
                    onAccept={() => {
                      axiosInstance.get(`/request/${item.id}/accept`, {
                        headers: { Authorization: "Bearer " + user?.token },
                      });
                    }}
                    accepted={false}
                  />
                )}
              />
            ) : (
              <Card width={Dimensions.get("screen").width * 0.7} height={100}>
                <Text fontFamily="Vazirmatn_500Medium">
                  اون ورا انگار هیچکی نسخ نیست
                </Text>
              </Card>
            )}
          </>
        )}
      </View>
      <Modal
        backgroundColor="#000000aa"
        onClose={() => setOpen(false)}
        isOpen={open}
        closeOnOverlayClick
      >
        <Card
          alignItems="center"
          justifyContent="center"
          display="flex"
          width={"70%"}
          height={"30%"}
        >
          <View display="flex" alignItems="flex-end">
            <Text mb={4} fontSize={12} fontFamily="Vazirmatn_500Medium">
              چند نخ می خوای حالا؟
            </Text>
            <Input
              mb={16}
              variant="outline"
              isDisabled={false}
              isInvalid={false}
              isReadOnly={false}
              width={"70%"}
            >
              <InputField
                value={amount.toString()}
                onChangeText={(value) => setAmount(parseInt(value) || 0)}
                keyboardType="number-pad"
                fontFamily="Vazirmatn_500Medium"
              />
            </Input>
          </View>
          <Button
            onPress={() =>
              axiosInstance
                .post(
                  `/nasakham`,
                  { amount, lat: location?.[1], long: location?.[0] },
                  {
                    headers: {
                      Authorization: "Bearer " + user?.token,
                    },
                  }
                )
                .then((data) => {
                  setAmount(0);
                  setOpen(false);
                })
            }
            w={"70%"}
            backgroundColor="#f7941d"
          >
            <Text color="$white" fontFamily="Vazirmatn_500Medium">
              ثبت
            </Text>
          </Button>
        </Card>
      </Modal>
    </View>
  );
}
