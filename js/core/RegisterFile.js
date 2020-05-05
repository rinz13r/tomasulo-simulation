function RegisterFile (capacity) {
    this.capacity = capacity;
    this.arr = new Array (capacity);
    this.arr.fill (0);
    this.arr[0] = 8;
    this.arr[1] = 7;
}
RegisterFile.prototype.get = function (p) {
    return this.arr[p];
}
RegisterFile.prototype.set = function (p, v) {
    this.arr[p] = v;
}
