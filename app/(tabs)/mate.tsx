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
      await requestCameraPermissionsAsync();
      await requestMicrophonePermissionsAsync();
    })();

    if (socket.id) {
      console.log(socket.id);
      const peer = new Peer(socket.id, {
        host: process.env.EXPO_PUBLIC_BASE_URL,
        port: process.env.NODE_ENV === "production" ? 443 : 4000,
        path: "/peerjs",
      });
      peer.on("open", (id) => {
        setMyPeer(peer);
        console.log(id);
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
      });
    }

    return () => {
      setPartnerPeerId(undefined);
      socket.emit("end-match", partnerPeerId);
      myPeer?.destroy();
    };
  }, [socket.id]);

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
    <View display="flex" w="$full" h="$full" gap={8}>
      <video ref={remoteVideoRef} style={{ flex: 1 }} />
      <video ref={localVideoRef} style={{ flex: 1 }} muted />
      <View flexDirection="row" gap={8} display="flex" w={"$full"} padding={16}>
        <Button
          flex={3}
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

        <Button
          onPress={() => setVideoCall(!videoCall)}
          bgColor={!videoCall ? "black" : "#f7941d"}
        >
          <Ionicons size={16} color={"white"} name="camera" />
        </Button>
      </View>
    </View>
  );
}
