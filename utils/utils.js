const connection = require("../database/database");
const mysql = require("mysql2/promise");

const deleteGuildChannel = async (guildID) => {
    try {
        const [result] = await connection.execute(`DELETE FROM Channels WHERE guildID = ${guildID}`);
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}

const deleteGuildRole = async (guildID) => {
    try {
        const [result1] = await connection.execute(`DELETE FROM Roles WHERE guildID = ${guildID}`);
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}

const deleteOnlyRedAlert = async (guildID) => {
    try {
        const [result1] = await connection.execute(`DELETE FROM OnlyRedAlert WHERE guildID = ${guildID}`);
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}

const addChannel = async (guildID, channelID) => {
    try {
        if (guildID == "" || channelID == "") {
            return false;
        }
        const [result] = await connection.execute(`INSERT INTO Channels (guildID, channelID) VALUES (${guildID}, ${channelID})`);
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}

const getAllChannels = async () => {
    try {
        const [result] = await connection.execute(`SELECT guildID, channelID from Channels`);
        return result;
    } catch (error) {
        console.log(error)
        return [];
    }
}

const getAllRoles = async () => {
    try {
        const [result] = await connection.execute(`SELECT guildID, roleID from Roles`);
        return result;
    } catch (error) {
        console.log(error)
        return [];
    }
}

const setRole = async (guildID, roleID) => {
    try {
        if (guildID == "" || roleID == "") {
            return false;
        }
        const [result] = await connection.execute(`INSERT INTO Roles (guildID, roleID) VALUES (${guildID}, ${roleID})`);
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}

const getAllOnlyRedAlert = async () => {
    try {
        const [result] = await connection.execute(`SELECT guildID, enabled from OnlyRedAlert`);
        return result;
    } catch (error) {
        console.log(error)
        return false;
    }
}

const setOnlyRedAlert = async (guildID, enabled) => {
    try {
        if (guildID == "") {
            return false;
        }
        const [result] = await connection.execute(`INSERT INTO OnlyRedAlert (guildID, enabled) VALUES (${guildID}, ${enabled})`);
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}

const formatDate = (date) => {
    try {
        date.setSeconds(0);
        let str = date.toLocaleString('he-il', { timeZone: 'Asia/Jerusalem' });

        str = str.replace(/\./g, "/");
        str = str.substring(0, str.length - 3);
        let strSplit = str.split(", ");
        str = strSplit[1] + " - " + strSplit[0];

        return str;
    } catch (error) {
        return "undefined";
    }
}

const getRoleID = (guildID, roles) => {
    let result = roles.find(obj => {
        return obj.guildID == guildID
    })
    if (result != undefined) {
        return result.roleID;
    }
    return undefined;
}

const getOnlyRedAlert = (guildID, allRedAlert) => {
    let result = allRedAlert.find(obj => {
        return obj.guildID == guildID
    })
    if (result != undefined) {
        return result.enabled;
    }
    return false;
}

module.exports = { deleteGuildChannel, deleteGuildRole, addChannel, getAllChannels, setRole, getAllRoles, formatDate, getRoleID, getAllOnlyRedAlert, setOnlyRedAlert, deleteOnlyRedAlert, getOnlyRedAlert }