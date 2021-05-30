const connection = require("./database");

async function createTables() {
    let sql = `CREATE TABLE IF NOT EXISTS Channels (
        guildID CHAR(25) NOT NULL,
        channelID CHAR(25) NOT NULL,
        dateAdded datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (guildID, channelID)
    )`;
    await connection.execute(sql);

    sql = `CREATE TABLE IF NOT EXISTS Roles (
        guildID CHAR(25) NOT NULL,
        roleID CHAR(25),
        dateAdded datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (guildID, roleID)
    )`;
    await connection.execute(sql);

    sql = `CREATE TABLE IF NOT EXISTS OnlyRedAlert (
        guildID CHAR(25) NOT NULL,
        enabled boolean DEFAULT false,
        PRIMARY KEY (guildID)
    )`;
    await connection.execute(sql);
}
module.exports = createTables;