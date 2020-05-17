function RegisterFile (capacity, config) {
    this.capacity = capacity;
    this.arr = new Array (capacity);
    this.arr.fill (0);
    for (let i in config) {
        this.arr[i] = Number (config[i]);
    }
}
RegisterFile.prototype.get = function (p) {
    return this.arr[p];
}
RegisterFile.prototype.set = function (p, v) {
    this.arr[p] = v;
}
