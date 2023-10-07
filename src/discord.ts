import { EmbedBuilder, WebhookClient } from "discord.js";

import { log } from "./utils";

let webhookClient: WebhookClient | null = null;

export function setupWebhookClient() {
	const webHookUrl: string = process.env.WEBHOOK_URL || "";

	webhookClient = new WebhookClient({
		url: webHookUrl.replace("discordapp", "discord"),
	});
}

export async function sendDiscordMessage(data: any): Promise<void> {
	log("Sending discord message...");

	if (!webhookClient) return log("Webhook client is null!");

	let title = data.body.find((x: any) => x.type == "title")?.value || " ";
	let description =
		data.body.find((x: any) => x.type == "text")?.value || " ";

	if (description && description.length >= 3000) {
		description = description.slice(0, 3000) + "...";
	}

	let media = data.body.filter(
		(x: any) => x.type == "image" || x.type == "video"
	);

	const embed = new EmbedBuilder();

	if (media && media.length > 0) {
		embed.setImage(media[0].value.previewUrl);
	}

	embed
		.setColor(0xff0000)
		.setTitle(title)
		.setURL(data.link)
		.setAuthor({
			name: data.writer.display_name,
			iconURL: data.writer.avatar,
			url: `https://hamal.co.il/main/${data.metaData.slug}`,
		})
		.setDescription(description)
		.setTimestamp(new Date(data.publishedAt));

	await webhookClient.send({ embeds: [embed] });
}
