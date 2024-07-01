import socket from "@/lib/socket";
import Peer from "peerjs";
import { useEffect, useRef, useState } from "react";
import {
  getCameraPermissionsAsync,
  requestCameraPermissionsAsync,
  getMicrophonePermissionsAsync,
  requestMicrophonePermissionsAsync,
} from "expo-camera";
import {
  Button,
  CloseIcon,
  Icon,
  SearchIcon,
  Spinner,
  Text,
  View,
} from "@gluestack-ui/themed";

import { Ionicons } from "@expo/vector-icons";

export default function MatePage() {
  const [myPeer, setMyPeer] = useState<Peer>();
  const [partnerPeerId, setPartnerPeerId] = useState<string>();
  const [videoCall, setVideoCall] = useState<boolean>(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [myStream, setMyStream] = useState<MediaStream>();

  useEffect(() => {
    (async () => {
      const cameraPermission = await getCameraPermissionsAsync();
      const micPermission = await getMicrophonePermissionsAsync();
      if (!cameraPermission.granted) await requestCameraPermissionsAsync();
      if (!micPermission.granted) await requestMicrophonePermissionsAsync();
    })();

    socket.on("matched", (partnerSocketId) => {
      const peer = new Peer(socket.id || "", {
        host:
          process.env.NODE_ENV === "production" ? "nasakh.app" : "localhost",
        port: process.env.NODE_ENV === "production" ? 443 : 4000,
        path: "/peerjs",
      });
      peer.on("open", (id) => {
        setMyPeer(peer);
      });
      setLoading(false);
      setPartnerPeerId(partnerSocketId);
    });
    socket.on("matching", () => {
      setLoading(true);
    });
    socket.on("match-ended", () => {
      setPartnerPeerId(undefined);
      myPeer?.disconnect();
      setMyPeer(undefined);
    });

    return () => {
      setPartnerPeerId(undefined);
      socket.emit("end-match", partnerPeerId);
      myPeer?.disconnect();
      setMyPeer(undefined);
    };
  }, []);

  useEffect(() => {
    if (myPeer && myStream)
      myPeer.on("call", (call) => {
        call.answer(myStream);
        call.on("stream", (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play();
          }
        });
      });
  }, [myPeer, myStream]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: videoCall, audio: true })
      .then((stream) => {
        setMyStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play();
        }
      });
  }, [navigator, videoCall]);

  useEffect(() => {
    if (myPeer && partnerPeerId && myStream) {
      const call = myPeer.call(partnerPeerId, myStream);
      call.on("stream", (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play();
        }
      });
    }
  }, [myPeer, partnerPeerId, myStream]);
  return (
    <View display="flex" w="$full" h="$full" gap={4}>
      <Text
        fontFamily="Vazirmatn_500Medium"
        fontSize={"$sm"}
        paddingHorizontal={16}
      >
        {loading
          ? "وایسا یکی گردنت بگیره"
          : partnerPeerId
            ? "گردن گرفتنت"
            : "دکمه سرچ پایین رو بزن تا گردن بگیرنت"}
      </Text>
      <video ref={remoteVideoRef} style={{ flex: 1, maxWidth: "100vw" }} />
      <video
        ref={localVideoRef}
        style={{
          position: "absolute",
          bottom: 16,
          height: "20vh",
          width: "20vw",
          left: 16,
        }}
        muted
        playsInline
      />
      <View
        position="absolute"
        flexDirection="column"
        gap={8}
        display="flex"
        bottom={16}
        right={16}
      >
        <Button
          rounded={"$full"}
          onPress={() => setVideoCall(!videoCall)}
          bgColor={!videoCall ? "black" : "#f7941d"}
        >
          <Ionicons size={16} color={"white"} name="camera" />
        </Button>
        <Button
          onPress={() => {
            if (!partnerPeerId) socket.emit("find-match");
            else {
              socket.emit("end-match", partnerPeerId);
            }
          }}
          bgColor="#f7941d"
        >
          {loading ? (
            <Spinner color="white" />
          ) : partnerPeerId ? (
            <CloseIcon color="$white" />
          ) : (
            <SearchIcon color="$white" />
          )}
        </Button>
      </View>
    </View>
  );
}
