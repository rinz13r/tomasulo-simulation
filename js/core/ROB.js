function ROB_Element () {
    this.done = false;
}
ROB_Element.prototype.populate = function (reg) {
    this.reg = reg;
    this.done = false;
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
        let res = this.arr[this.start].val;
        if (isNaN (res)) { // Exception case
            alert (res.msg);
            this.issue = this.start;
            for (let i = 0; i < this.rat.capacity; i++) {
                this.rat.set (i); // Make all RAT entries point to RegisterFile
            }
            for (let i = 0; i < this.capacity; i++) {
                this.arr[i].done = false;
            }
            return;
        }
        let event = {
            kind : 'ROB_Commit',
            entry: `ROB${this.start}`,
            res  : this.arr[this.start].val,
            reg  : this.arr[this.start].reg,
        };

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
