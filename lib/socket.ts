import io from "socket.io-client";

const socket = io(`${process.env.EXPO_PUBLIC_BASE_URL}`, {
  transports: ["websocket"],
});

export default socket;
