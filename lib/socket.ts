import io from "socket.io-client";

const socket = io(`http://${process.env.EXPO_PUBLIC_BASE_URL}:4000`).connect();

export default socket;
