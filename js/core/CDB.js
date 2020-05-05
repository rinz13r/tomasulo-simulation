function CDB (rs, rob) {
    this.rs = rs;
    this.rob = rob;
}
CDB.prototype.notify = function (event) {
    this.rs.notify (event);
    this.rob.notify (event);
}
