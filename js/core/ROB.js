function ROB_Element () {
    this.done = false;
}
ROB_Element.prototype.populate = function (reg) {
    this.reg = reg;
}
ROB_Element.prototype.write  = function (val) {
    this.val = val;
    this.done = true;
}

function ROB (registerFile, rat) {
    this.registerFile = registerFile;
    this.rat = rat;
    this.arr = new Array (100);
    for (let i = 0; i < 100; ++i) {
        this.arr[i] = new ROB_Element ();
    }
    this.capacity = 100;
    this.end = 0;
    this.start = 0;
}
ROB.prototype.insert = function (reg) {
    this.arr[this.end%this.capacity].populate (reg);
    this.end++;
    return `ROB${this.end-1}`;
}
ROB.prototype.commit = function () {
    if (this.arr[this.start%this.capacity].done) {
        let event = {
            kind : 'ROB_Commit',
            entry: `ROB${this.start}`,
            res  : this.arr[this.start].val,
            reg  : this.arr[this.start].reg,
        };

	// TODO: nitpick: no need to do this, as this branch is entered only
	// if 'done' is true.
        this.arr[this.start%this.capacity].done = true;

	// Now, head of ROB points to next entry in the queue.
        this.start++;
        this.rat.notify (event); // RAT notifies the registerFile
    }
}
ROB.prototype.notify = function (event) {
    if (event.kind == 'broadcast') {

	// src0 --> rob = 0
        let rob = event.dst.substr (3);
        this.arr[rob].write (event.res);
    }
};
