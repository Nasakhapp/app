import socket from "@/lib/socket";
import Peer, { MediaConnection } from "peerjs";
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

export default function HamKaamPage() {
  const [myPeer, setMyPeer] = useState<Peer>();
  const [partnerPeerId, setPartnerPeerId] = useState<string>();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [myStream, setMyStream] = useState<MediaStream>();
  const [myCall, setMyCall] = useState<MediaConnection>();
  const [partnerCall, setPartnerCall] = useState<MediaConnection>();

  const getStream = (remoteStream: MediaStream) => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play();
    }
  };

  useEffect(() => {
    (async () => {
      const cameraPermission = await getCameraPermissionsAsync();
      const micPermission = await getMicrophonePermissionsAsync();
      if (!cameraPermission.granted) await requestCameraPermissionsAsync();
      if (!micPermission.granted) await requestMicrophonePermissionsAsync();
    })();

    const peer = new Peer(socket.id || "", {
      host: process.env.NODE_ENV === "production" ? "nasakh.app" : "localhost",
      port: process.env.NODE_ENV === "production" ? 443 : 4000,
      path: "/peerjs",
      secure: true,
      debug: 3,
      config: {
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302",
          },
        ],
      },
    });
    peer.on("open", () => {
      setMyPeer(peer);
    });

    socket.on("matched", (partnerSocketId) => {
      setLoading(false);
      setPartnerPeerId(partnerSocketId);
    });
    socket.on("matching", () => {
      setLoading(true);
    });
    socket.on("match-ended", () => {
      setPartnerPeerId(undefined);
      myCall?.removeAllListeners();
      myCall?.close();
      myCall?.peerConnection
        .getSenders()
        .forEach((sender) => sender.track?.stop());
      setMyCall(undefined);
      partnerCall?.removeAllListeners();
      partnerCall?.close();
      partnerCall?.peerConnection
        .getSenders()
        .forEach((sender) => sender.track?.stop());
      setPartnerCall(undefined);
    });

    return () => {
      socket.emit("end-match", partnerPeerId);
      setPartnerPeerId(undefined);
      myCall?.removeAllListeners();
      myCall?.close();
      myCall?.peerConnection
        .getSenders()
        .forEach((sender) => sender.track?.stop());
      setMyCall(undefined);
      partnerCall?.removeAllListeners();
      partnerCall?.close();
      partnerCall?.peerConnection
        .getSenders()
        .forEach((sender) => sender.track?.stop());
      setPartnerCall(undefined);
      myPeer?.destroy();
      setMyPeer(undefined);
    };
  }, []);

  useEffect(() => {
    if (myPeer)
      myPeer.on("call", (call) => {
        if (!partnerCall) {
          setPartnerCall(call);
        }
      });
  }, [myPeer]);

  useEffect(() => {
    if (partnerCall && partnerPeerId) {
      partnerCall.answer(myStream);
      partnerCall.on("stream", getStream);
    }
  }, [partnerCall, partnerPeerId]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setMyStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play();
        }
      });
  }, [navigator]);

  useEffect(() => {
    if (myPeer && partnerPeerId && myStream && !myCall) {
      const call = myPeer.call(partnerPeerId, myStream);
      setMyCall(call);
    }
  }, [myPeer, partnerPeerId, myStream]);

  useEffect(() => {
    if (myCall && partnerPeerId) myCall.on("stream", getStream);
  }, [myCall, partnerPeerId]);
  return (
    <View display="flex" w="$full" h="$full" gap={4}>
      <Text
        fontFamily="Vazirmatn_700Bold"
        fontSize={"$md"}
        paddingHorizontal={16}
      >
        {loading
          ? "وایسا یکی گردنت بگیره..."
          : partnerPeerId
            ? "گردن گرفتنت"
            : "دکمه سرچ پایین رو بزن تا گردن بگیرنت"}
      </Text>
      <video
        poster="/assets/images/logo-small.png"
        ref={remoteVideoRef}
        style={{ flex: 1, maxWidth: "100vw" }}
        autoPlay
        playsInline
      />
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
        autoPlay
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
