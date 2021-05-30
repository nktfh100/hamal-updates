var firebase = require('firebase')
const Discord = require("discord.js");
const config = require("./utils/config.js");
const createTables = require('./database/createTables.js');
const { deleteGuildChannel, deleteGuildRole, addChannel, getAllChannels, setRole, getAllRoles, formatDate, getRoleID, setOnlyRedAlert, deleteOnlyRedAlert, getAllOnlyRedAlert, getOnlyRedAlert } = require("./utils/utils.js");

// hamal
const firebase_config = {
    apiKey: "AIzaSyCP5pb-kTM7S30CBwYfcyYmhWS6q7cpFxA",
    authDomain: "walla-hamal.firebaseapp.com",
    databaseURL: "https://walla-hamal.firebaseio.com",
    CDNDatabaseURL: "https://hamaldb.wcdn.co.il",
    storageBucket: "walla-hamal.appspot.com",
    serverKey: "AAAAGxUKxm0:APA91bFQCl0dZvppki3ESbjY7IR0UgNwPuNlpDx3_na9kWkShQvj8X9RrCRnhlD8SaeV4QxyS350-tC2FkOeaHPWO1TqX7VgOkp4TVAtvzXJAVrR63hOqvPxpbpFHAbEvK_xVuDAM3VN"
}

const env = process.env.NODE_ENV || 'PRODUCTION';
const connectToFirebase = true;
const prefix = "&";

async function main() {

    await createTables();

    const client = new Discord.Client();

    client.on("ready", async () => {
        console.log("Bot ready - " + env);
        console.log(`currently in ${client.guilds.cache.size} servers`);

        client.user.setActivity(config.ACTIVITY, { type: 'PLAYING' }).catch(console.error);

        if (connectToFirebase) {
            console.log("Connecting to hamal's firebase...")
            firebase.initializeApp(firebase_config)
            const database = firebase.database();
            const firebaseRef = database.ref('articles').orderByChild('timestamp').startAt((new Date).getTime())
            firebaseRef.on("child_added", async (data) => {
                try {
                    let newPost = data.val();
                    const postKey = data.key;
                    const date = formatDate(new Date());
                    // console.log(newPost)

                    let isRedAlert = false;

                    if (newPost.stamp != null) { // if red alert or not
                        if (newPost.stamp.text == 'אזעקה') {
                            isRedAlert = true;
                        }
                    }

                    console.log(`[${date}] Got a new hamal update: ${postKey} is red alert: ` + isRedAlert);

                    const channels = await getAllChannels();
                    const roles = await getAllRoles();
                    const onlyRedAlert = await getAllOnlyRedAlert();

                    let postContent = newPost.content;
                    if (postContent.length >= 1500) {
                        postContent = postContent.substring(0, 1490) + "......";
                    }

                    let description = date + "\n\n" + postContent;

                    if (newPost.hashtags != undefined) {
                        description += "\n\n"
                        Object.keys(newPost.hashtags).forEach(key => {
                            let hashtag_ = newPost.hashtags[key];
                            description += `[#${hashtag_.name.replace(/_/g, " ")}](https://www.hamal.co.il/hashtag/${hashtag_.uid}) `
                        });
                    }

                    if (description.length > 2048) {
                        return;
                    }

                    const messageObj = {
                        embed: {
                            "title": newPost.writer.name,
                            "description": description,
                            "url": "https://www.hamal.co.il/post/" + postKey,
                            "color": "#c81920",
                            "thumbnail": {
                                "url": newPost.writer.image
                            }
                        }
                    };

                    if (newPost.media != null && newPost.media.length > 0) {
                        messageObj.embed.description += `\n\n`;
                        for (let i = 0; i < newPost.media.length; i++) {
                            let mediaObj = newPost.media[i];

                            if (i == 0) {
                                if (mediaObj.type == "video") {
                                    messageObj.embed.image = { url: mediaObj.thumbnail }
                                } else {
                                    messageObj.embed.image = { url: mediaObj.src }
                                }
                            }
                            let linkText = (i + 1) + "-";
                            if (newPost.media.length == 1) {
                                linkText = "";
                            }
                            if (mediaObj.type == "video") {
                                linkText += "וידאו";
                            } else if (mediaObj.type == "image") {
                                linkText += "תמונה";
                            } else {
                                linkText += "לינק";
                            }
                            if (linkText != "") {
                                messageObj.embed.description += `[${linkText}](${mediaObj.src}) `;
                            }
                        }
                        messageObj.embed.description += `\n`;
                    }


                    for (let i = 0; i < Object.keys(channels).length; i++) {
                        try {
                            // Get if this server only wants red alert updates (from the mysql database)
                            if (getOnlyRedAlert(channels[i]["guildID"], onlyRedAlert) && !isRedAlert) {
                                continue;
                            }

                            const channel = client.channels.cache.get(channels[i]["channelID"]);
                            if (channel == undefined) {
                                continue;
                            }

                            const perms = channel.permissionsFor(client.user).toArray();
                            if (perms.includes("SEND_MESSAGES") && perms.includes("VIEW_CHANNEL") && perms.includes("EMBED_LINKS")) {
                                const roleID = getRoleID(channels[i]["guildID"], roles);
                                let msg = "";
                                if (roleID != undefined) {
                                    msg = `<@&${roleID}>`;
                                }
                                channel.send(msg, messageObj).catch(err => { });
                            }
                        } catch (error) {
                        }
                    }
                } catch (error) {
                    console.log(error)
                }
            })
        }
    });

    client.on('guildCreate', async (newGuild) => {
        console.log("Joined server: " + newGuild.name);
        console.log("Currently active in " + client.guilds.cache.size + " servers.");
        await setOnlyRedAlert(newGuild.id, false);
    });

    client.on("guildDelete", async (guildLeft) => {
        console.log("Left server: " + guildLeft.name);
        await deleteGuildChannel(guildLeft.id);
        await deleteGuildRole(guildLeft.id);
        await deleteOnlyRedAlert(guildLeft.id)
    });

    client.on("message", async (message) => {
        if (message.author.bot) return;
        if (!message.content.startsWith(prefix)) return;
        if (message.channel.type === 'dm') return;
        try {
            const commandBody = message.content.slice(prefix.length);
            const args = commandBody.split(' ');
            const command = args.shift().toLowerCase();

            if (message.author.id != message.guild.ownerID && message.author.id != "250706460177072128") {
                if (command == "help" || command == "channel" || command == "role" || command == "redalert") {
                    message.reply("Only the owner of this server can use this command");
                }
                return;
            }

            const guildID = message.guild.id;
            if (command === "help") {
                message.reply(`\n${prefix}channel #channel --> To set the updates channel.
                \n${prefix}Role @role --> To set which role will get mentioned. (set to "none" to not mention any role)
                \n${prefix}redalert true/false --> To only get red alerts updates`)
            } else if (command === "channel") {
                if (message.mentions.channels.size >= 1) {
                    const channel = message.mentions.channels.first();
                    const permissions = channel.permissionsFor(client.user).toArray();
                    if (permissions.includes("SEND_MESSAGES") && permissions.includes("VIEW_CHANNEL")) {
                        if (!permissions.includes("EMBED_LINKS")) {
                            message.reply(`I don't have permission to embed links in <#${channel.id}>!`);
                            return;
                        }
                        let isOK = true;
                        isOK = await deleteGuildChannel(guildID);
                        isOk = await addChannel(guildID, channel.id);
                        if (isOk) {
                            message.reply(`Hamal updates will now be sent to <#${channel.id}>.`);
                        } else {
                            message.reply("Something went wrong.");
                        }
                        return;
                    } else {
                        message.reply(`I don't have permission to send messages in <#${channel.id}>!`);
                    }
                } else {
                    message.reply("You must tag a valid channel!").catch(err => { });
                }
                return;
            } else if (command == "role") {
                if (message.mentions.roles.size >= 1) {
                    const role = message.mentions.roles.first();
                    message.reply(`<@&${role.id}> will now be mentioned for updates.`);
                    await deleteGuildRole(guildID);
                    await setRole(guildID, role.id);
                } else {
                    if (args.length > 0 && args[0].toLowerCase() == "none") {
                        message.reply("No roles will be mentioned from now on.");
                        await deleteGuildRole(guildID);
                    } else {
                        message.reply("You must mention a valid role!");
                    }
                }
                return;
            } else if (command == "redalert") {
                if (args.length > 0 && (args[0].toLowerCase() == "true" || args[0].toLowerCase() == "false")) {
                    let is = args[0].toLowerCase() == "true";
                    if (is) {
                        message.reply("You will now only get red alert updates");
                    } else {
                        message.reply("You will now get all hamal updates");
                    }
                    await deleteOnlyRedAlert(guildID);
                    await setOnlyRedAlert(guildID, is);
                } else {
                    message.reply("Must be true / false.");
                }
                return;
            } else if (message.author.id == "250706460177072128") {
                if (command == "servers") {
                    message.reply(`Currently active in ${client.guilds.cache.size} servers.`);
                }
            }

        } catch (error) {
            message.reply("Something went wrong. (" + error.message + ")");
            console.log("Something went wrong using command", error);
            return;
        }
    });

    client.login(config.BOT_TOKEN);
}

// axios.get(`https://hamaldb.wcdn.co.il/articles.json?orderBy="timestamp"&limitToLast=${5}&startAt=${864e5}`)
//     .then((response) => {
//         console.log(JSON.stringify(response.data));
//     }, (error) => {
//         console.log(error);
//     });

main();