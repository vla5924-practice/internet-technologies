var mysql = require('sync-mysql');

module.exports = function(connectionParams) {
    //this._db = mysql.createConnection(connectionParams);
    //this._db.connect();
    this._db = new mysql(connectionParams);

    this.query = function (sql) {
        let result = this._db.query(sql);
        return result;
    };
    
    this.row = function (sql) {
        let all = this.query(sql);
        return all[0];
    };
};
