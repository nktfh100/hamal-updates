import { sendDiscordMessage, setupWebhookClient } from "./discord";

import dotenv from "dotenv";
import { log } from "./utils";
import socket from "./socketio";

dotenv.config();

async function main() {
	setupWebhookClient();

	socket.on("item-create", (data) => {
		log("Item create");
		// log(JSON.stringify(data, null, 4));
		sendDiscordMessage(data);
	});

	// socket.on("item-update", (data) => {
	// 	log("Item update: " + JSON.stringify(data, null, 4));
	// });
}

main();
