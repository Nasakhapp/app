import { FontAwesome6, Ionicons } from "@expo/vector-icons";
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
  Spinner,
  Text,
  View,
} from "@gluestack-ui/themed";
import { CameraRef } from "@rnmapbox/maps/lib/typescript/src/components/Camera";
import { Position } from "@rnmapbox/maps/lib/typescript/src/types/Position";
import { createRef, useContext, useEffect, useState } from "react";
import { Dimensions } from "react-native";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

import {
  LocationContext,
  RequestContext,
  RequestsContext,
  UserContext,
} from "@/components/Contexts/Contexts";
import MapView from "@/components/MapView";
import RequestCard from "@/components/RequestCard";
import axiosInstance from "@/lib/Instance";
import socket from "@/lib/socket";
import { useInitData } from "@tma.js/sdk-react";

export default function HomePage() {
  const [focus, setFocus] = useState<number>();
  const camera = createRef<CameraRef>();
  const slider = createRef<ICarouselInstance>();
  const { activeRequest, setActiveRequest } = useContext(RequestContext);
  const { location, setLocation } = useContext(LocationContext);
  const { requests, setRequests } = useContext(RequestsContext);
  const { setUser, user } = useContext(UserContext);
  const [amount, setAmount] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);
  const [najiLocation, setNajiLocation] = useState<Position>([0, 0]);

  const initData = useInitData();

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

  if (!user?.token && !location?.[0] && !location?.[1])
    return (
      <View
        width="100%"
        height="100%"
        position="relative"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner />
      </View>
    );
  return (
    <View width="100%" height="100%" position="relative">
      <MapView
        // focus={focus}
        // camera={camera}
        najiLocation={najiLocation}
        requests={requests!}
        activeRequest={activeRequest}
        setLocation={setLocation}
        location={location}
      />
      {!activeRequest?.role ? (
        <Button
          position="absolute"
          top={16}
          right={16}
          backgroundColor="$black"
          onPress={() => setOpen(true)}
          disabled={!location?.[0] && !location?.[1]}
        >
          {!location?.[0] && !location?.[1] ? (
            <View display="flex" flexDirection="row-reverse" gap={16}>
              <Text fontFamily="Vazirmatn_500Medium" color="$white">
                درحال موقعیت یابی
              </Text>
              <Spinner color="white" />
            </View>
          ) : (
            <FontAwesome6
              name="hand-holding"
              size={24}
              color="#fff"
              style={{ marginTop: -12 }}
            />
          )}
        </Button>
      ) : null}
      <View
        bottom={16}
        position="absolute"
        width="100%"
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
                height={Dimensions.get("screen").height * 0.15}
                loop={false}
                onSnapToItem={(index) => setFocus(index)}
                width={Dimensions.get("screen").width}
                data={requests}
                ref={slider}
                renderItem={({ item, index }) => (
                  <View
                    width={Dimensions.get("screen").width}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <RequestCard
                      item={item}
                      width={Dimensions.get("screen").width * 0.7}
                      location={location}
                      onAccept={() => {
                        axiosInstance.get(`/request/${item.id}/accept`, {
                          headers: { Authorization: "Bearer " + user?.token },
                        });
                      }}
                      accepted={false}
                    />
                  </View>
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
                <Ionicons
                  name="sad-outline"
                  style={{ marginBottom: 8 }}
                  size={24}
                />
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
                width="100%"
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
              w="100%"
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
