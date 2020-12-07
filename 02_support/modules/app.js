let database = require('./database.js');

const tables = {
    users     : "users",
    customers : "customers",
    managers  : "managers",
    tickets   : "tickets"
};

const roles = [ "customer", "manager", "admin" ];

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
        session VARCHAR(10) NOT NULL
    )`);
    db.query(`CREATE TABLE IF NOT EXISTS ${tables.tickets} (
        id INTEGER AUTO_INCREMENT PRIMARY KEY NOT NULL,
        timestamp BIGINT,
        description TEXT NOT NULL,
        created_by INTEGER NOT NULL,
        assigned_to INTEGER NOT NULL,
        is_closed INTEGER DEFAULT 0 NOT NULL,
        comment TEXT NOT NULL
    )`);
    isInitialized = true;
};

module.exports.setDemo = function (users) {
    this.checkDb();
    users.forEach(user => {
        db.query(`INSERT INTO ${tables.users} SET 
                 login = '${user.login}', 
                 password = '${user.password}', 
                 fio = '${user.fio}', 
                 phone = '${user.phone}', 
                 role = ${user.role}`);
    });
};

module.exports.authUserWithSession = function (session) {
    this.checkDb();
    let userExists = db.row(`SELECT COUNT(*) FROM ${tables.users} WHERE session = '${session}'`)["COUNT(*)"];
    if (!userExists)
        return { ok: false };
    let user = db.row(`SELECT * FROM ${tables.users} WHERE session = '${session}'`);
    return { ok: true, ...user};
};

module.exports.authUserWithLogin = function (login, password) {
    this.checkDb();
    let userExists = db.row(`SELECT COUNT(*) FROM ${tables.users} WHERE login = '${login}' AND password = '${password}'`)["COUNT(*)"];
    if (!userExists)
        return { ok: false };
    let user = db.row(`SELECT * FROM ${tables.users} WHERE login = '${login}'`);
    user.session = user.id + user.login;
    db.query(`UPDATE ${tables.users} SET session = '${user.session}' WHERE id = ${user.id}`);
    return { ok: true, ...user};
};

module.exports.getTickets = function () {
    this.checkDb();
    return db.query(`SELECT * FROM ${tables.tickets} ORDER BY timestamp DESC`);
};

module.exports.getUsers = function () {
    this.checkDb();
    let usersRaw = db.query(`SELECT * FROM ${tables.users}`);
    let users = {};
    usersRaw.forEach(user => { users[user.id] = user });
    return users;
};

module.exports.addTicket = function (userId, description) {
    this.checkDb();
    let ts = +new Date();
    let result = db.query(`INSERT INTO ${tables.tickets} SET timestamp = ${ts}, description = '${description}', created_by = ${userId}, assigned_to = 0, comment = ''`);
    return db.row(`SELECT * FROM ${tables.tickets} WHERE id = ${result.insertId}`);
};
