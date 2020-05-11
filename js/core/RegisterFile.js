function RegisterFile (capacity) {
    this.capacity = capacity;
    this.arr = new Array (capacity);
    this.arr.fill (0);

    // Block: Why are we setting these values? Do they serve some purpose?
    let temps = [0, -23, 16, 45, 5, 3, 4, 1, 2];
    for (let i = 0; i < temps.length; i++) this.arr[i] = temps[i];
    // this.arr[0] = 8;
    // this.arr[1] = 4;
}
RegisterFile.prototype.get = function (p) {
    return this.arr[p];
}
RegisterFile.prototype.set = function (p, v) {
    this.arr[p] = v;
}
