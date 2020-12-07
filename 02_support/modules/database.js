var mysql = require('sync-mysql');

module.exports = function(connectionParams) {
    this._db = new mysql(connectionParams);

    this.query = function (sql, ...params) {
        let result = this._db.query(sql, params);
        return result;
    };
    
    this.row = function (sql, ...params) {
        let all = this.query(sql, ...params);
        return all[0];
    };
};
