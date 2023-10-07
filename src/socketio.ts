import { io } from "socket.io-client";
import { log } from "./utils";

const socket = io("https://public-api-staging.hamal.co.il", {
	transports: ["websocket"],
});

socket.on("connect", () => {
	log("Connected to hamal socket.io server!");
});

socket.on("disconnect", () => {
	log("Disconnected from hamal socket.io server!");
});

export default socket;
