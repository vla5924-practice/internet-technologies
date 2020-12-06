var mysql = require('sync-mysql');

module.exports = function(connectionParams) {
    //this._db = mysql.createConnection(connectionParams);
    //this._db.connect();
    this._db = new mysql(connectionParams);

    this.fetchAll = function (sql) {
        let result = this._db.query(sql);
        return result;
    };
    
    this.exec = function (sql) {
        return this.fetchAll(sql);
    };

    this.fetchRow = function (sql) {
        let all = this.fetchAll(sql);
        console.log(sql + "\n");
        console.log(all);
        return all[0];
    };
    
    this.fetchOne = function (sql) {
        let row = this.fetchRow(sql);
        return row[0];
    };
};
