import io from "socket.io-client";

const socket = io(`https://${process.env.EXPO_PUBLIC_BASE_URL}`, {});

export default socket;
