import {
  Button,
  Card,
  CloseIcon,
  Icon,
  Input,
  InputField,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
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
  LocationContext,
  RequestContext,
  RequestsContext,
  UserContext,
} from "@/components/Contexts/Contexts";
import { Position } from "@rnmapbox/maps/lib/typescript/src/types/Position";

export default function HomePage() {
  const [focus, setFocus] = useState<number>();
  const camera = createRef<CameraRef>();
  const slider = createRef<Carousel<any>>();
  const { activeRequest, setActiveRequest } = useContext(RequestContext);
  const { location, setLocation } = useContext(LocationContext);
  const { requests, setRequests } = useContext(RequestsContext);
  const { setUser, user } = useContext(UserContext);
  const [amount, setAmount] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);
  const [najiLocation, setNajiLocation] = useState<Position>([0, 0]);

  useEffect(() => {
    if (!activeRequest?.role && location && !focus) {
      camera.current?.setCamera({
        centerCoordinate: [location[0], location[1]],
        animationDuration: 1000,
        zoomLevel: 16,
      });
    }
  }, [activeRequest, location]);

  useEffect(() => {
    if (focus && requests && requests[focus])
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
    ) {
      socket.emit("naji-location", {
        requestId: activeRequest.request.id,
        location,
      });
    }
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
  }, [najiLocation, activeRequest]);

  useEffect(() => {
    if (activeRequest?.request)
      if (
        activeRequest?.role === "NASAKH" &&
        activeRequest.request.status === "BRINGING" &&
        location
      )
        camera.current?.fitBounds(najiLocation, location, 60, 500);
      else if (activeRequest?.role === "NAJI" && location)
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
            setLocation?.([
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
          <FontAwesome6
            name="hand-holding"
            size={24}
            color="#fff"
            style={{ marginTop: -12 }}
          />
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
            najiLocation={najiLocation}
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
                data={requests}
                ref={slider}
                renderItem={({ item, index }) => (
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
              <Card
                display="flex"
                justifyContent="center"
                alignItems="center"
                width={Dimensions.get("screen").width * 0.7}
                height={100}
              >
                <Text fontSize={12} fontFamily="Vazirmatn_500Medium">
                  اون ورا انگار هیچکی نسخ نیست!
                </Text>
              </Card>
            )}
          </>
        )}
      </View>
      <Modal onClose={() => setOpen(false)} isOpen={open} closeOnOverlayClick>
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <View display="flex" alignItems="flex-end">
              <Text mb={4} fontSize={14} fontFamily="Vazirmatn_500Medium">
                چند نخ می خوای حالا؟
              </Text>
              <Input
                mb={16}
                variant="outline"
                isDisabled={false}
                isInvalid={false}
                isReadOnly={false}
                width={"100%"}
              >
                <InputField
                  value={amount.toString()}
                  onChangeText={(value) => setAmount(parseInt(value) || 0)}
                  keyboardType="number-pad"
                  fontFamily="Vazirmatn_500Medium"
                />
              </Input>
            </View>
          </ModalBody>
          <ModalFooter>
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
              w={"100%"}
              backgroundColor="#f7941d"
            >
              <Text color="$white" fontFamily="Vazirmatn_500Medium">
                ثبت
              </Text>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </View>
  );
}
