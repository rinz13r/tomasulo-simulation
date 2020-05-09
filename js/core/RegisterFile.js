function RegisterFile (capacity) {
    this.capacity = capacity;
    this.arr = new Array (capacity);
    this.arr.fill (0);

    // Block: Why are we setting these values? Do they serve some purpose?
    this.arr[0] = 8;
    this.arr[1] = 0;
}
RegisterFile.prototype.get = function (p) {
    return this.arr[p];
}
RegisterFile.prototype.set = function (p, v) {
    this.arr[p] = v;
}
