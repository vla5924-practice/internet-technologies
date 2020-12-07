let database = require('./database.js');
let md5 = require('js-md5');

const tables = {
    users     : "users",
    customers : "customers",
    managers  : "managers",
    tickets   : "tickets"
};


let db = new database({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'support'
});
let isInitialized = false;

module.exports.checkDb = function () {
    if (!isInitialized)
        throw "Error";
};

module.exports.init = function () {
    db.query(`CREATE TABLE IF NOT EXISTS ${tables.users} (
        id INTEGER AUTO_INCREMENT PRIMARY KEY NOT NULL,
        login VARCHAR(20) NOT NULL,
        password VARCHAR(20) NOT NULL,
        fio VARCHAR(100) DEFAULT '' NOT NULL,
        phone VARCHAR(20) DEFAULT '' NOT NULL,
        role INTEGER DEFAULT 0 NOT NULL,
        session VARCHAR(32) DEFAULT '' NOT NULL
    )`);
    db.query(`CREATE TABLE IF NOT EXISTS ${tables.tickets} (
        id INTEGER AUTO_INCREMENT PRIMARY KEY NOT NULL,
        timestamp BIGINT,
        description TEXT NOT NULL,
        created_by INTEGER NOT NULL,
        assigned_to INTEGER NOT NULL,
        is_closed INTEGER DEFAULT 0 NOT NULL,
        comment TEXT
    )`);
    isInitialized = true;
};

module.exports.authUserWithSession = function (session) {
    this.checkDb();
    let userExists = db.row(`SELECT COUNT(*) FROM ${tables.users} WHERE session = ?`, session)["COUNT(*)"];
    if (!userExists)
        return { ok: false };
    let user = db.row(`SELECT * FROM ${tables.users} WHERE session = ?`, session);
    return { ok: true, ...user};
};

module.exports.calculateSession = function (userId, login) {
    let str = Date.now().toString() + userId + Math.floor(Math.random() * 1000).toString() + login;
    return md5(str);
}

module.exports.authUserWithLogin = function (login, password) {
    this.checkDb();
    let userExists = db.row(`SELECT COUNT(*) FROM ${tables.users} WHERE login = ? AND password = ?`, login, password)["COUNT(*)"];
    if (!userExists)
        return { ok: false };
    let user = db.row(`SELECT * FROM ${tables.users} WHERE login = ?`, login);
    user.session = this.calculateSession(user.id, login);
    db.query(`UPDATE ${tables.users} SET session = ? WHERE id = ?`, user.session, user.id);
    return { ok: true, ...user};
};

module.exports.resetSession = function (session) {
    db.query(`UPDATE ${tables.users} SET session = '' WHERE session = ?`, session);
}

module.exports.getTickets = function (assignedToUserId = 0) {
    this.checkDb();
    if (assignedToUserId)
        return db.query(`SELECT * FROM ${tables.tickets} WHERE assigned_to = ? ORDER BY timestamp DESC`, assignedToUserId);
    return db.query(`SELECT * FROM ${tables.tickets} ORDER BY timestamp DESC`);
};

module.exports.getUsers = function () {
    this.checkDb();
    let usersRaw = db.query(`SELECT * FROM ${tables.users}`);
    let users = {};
    usersRaw.forEach(user => { users[user.id] = user });
    return users;
};

module.exports.getManagers = function () {
    this.checkDb();
    return db.query(`SELECT id, fio FROM ${tables.users} WHERE role = 1`);
};

module.exports.addTicket = function (userId, description) {
    this.checkDb();
    let ts = +new Date();
    let result = db.query(`INSERT INTO ${tables.tickets} SET timestamp = ?, description = ?, created_by = ?, assigned_to = 0, comment = ''`, ts, description, userId);
    return db.row(`SELECT * FROM ${tables.tickets} WHERE id = ?`, result.insertId);
};

module.exports.assignTicket = function (ticketId, userId) {
    this.checkDb();
    let result = db.query(`UPDATE ${tables.tickets} SET assigned_to = ? WHERE id = ?`, userId, ticketId);
    return { ok: true };
};

module.exports.setTicketClosed = function (ticketId, isClosed) {
    this.checkDb();
    let result = db.query(`UPDATE ${tables.tickets} SET is_closed = ? WHERE id = ?`, isClosed, ticketId);
    return { ok: true };
};

module.exports.setTicketComment = function (ticketId, comment) {
    this.checkDb();
    let result = db.query(`UPDATE ${tables.tickets} SET comment = ? WHERE id = ?`, comment, ticketId);
    return { ok: true };
};
