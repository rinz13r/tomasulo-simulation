function RAT (capacity, registerFile) {
    this.capacity = capacity;
    this.arr = new Array (capacity);
    this.arr.fill (undefined);
    this.instr_num = new Array (capacity);
    this.instr_num.fill (undefined);
    this.registerFile = registerFile;
}
RAT.prototype.get = function (p) {
    if (this.arr[p] === undefined) {
        return this.registerFile.get (p);
    }
    return this.arr[p];
}
RAT.prototype.set = function (p, v, instr_num) {
    this.arr[p] = v;
    this.instr_num[p] = instr_num;
}
RAT.prototype.notify = function (event) {
    if (event.kind == 'ROB_Commit') {
	// Update the actual register file.

	// Block: ADD R2, R3, 1  Here: R2 is renamed to say RAT2
	//        ADD R2, R4, R4 Here: R2 gets renamed to say RAT3

	// Here we first need to check whether ROB entry we removed is still pointing
	// to the same register, then set it. Else for case above, after RAT2 is removed
	// from ROB, we may change R2's value, but R2 is associated with RAT3.
        this.registerFile.set (event.reg, event.res);

	// Clear the register entry in RAT for further use.
        if (this.arr[event.reg] == event.entry) {
            this.arr[event.reg] = undefined;
        }
    }

    if (event.kind == 'squash') {
	for(let i = 0; i < this.capacity; ++i) {
	    if (this.instr_num[i] != undefined) {

		// Clear RAT entries of instructions issued after break.
		if (this.instr_num[i] >= event.i_num) {
		    console.log (`Clearing: ${i} RAT`);
		    this.arr[i] = undefined;
		    this.instr_num[i] = undefined;
		}
	    }
	}
    }
		
};
