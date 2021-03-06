function ROB_Element () {
    this.done = false;
    this.instr_num = -2;
    this.op = undefined;
}
ROB_Element.prototype.populate = function (op, instr_num, reg) {
    this.op = op;
    this.reg = reg;
    this.done = false;
    this.instr_num = instr_num;
}
ROB_Element.prototype.write  = function (val, age) {

    this.val = val;
    this.done = true;
    // let t = new Table (5, document.getElementById ('timeline'));
    // t.modifyCell (age, 3, global_clk);
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
    this.ages = new Array (100);
    this.age = 1;
}
ROB.prototype.insert = function (op, instr_num, reg) {
    this.arr[this.end%this.capacity].populate (op, instr_num, reg);
    this.ages[this.end%this.capacity] = this.age++;
    this.end++;
    return `ROB${this.end-1}`;
}
ROB.prototype.commit = function () {
    console.log (`commit: start: ${this.start}`);
    if (this.arr[this.start%this.capacity].done) {

	if (this.arr[this.start%this.capacity].op == 'beq') {
	    this.start++;
	} else {
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
    if (this.prevEvent != undefined) {

	// event can never be break_instr, it's always broadcast
        let event = this.prevEvent;
        let rob = event.dst.substr (3);
        this.arr[rob].write (event.res, event.age);
    }
    this.prevEvent = undefined;
}
ROB.prototype.notify = function (event) {
    if (event.kind == 'broadcast') {
	// src0 --> rob = 0
        // let rob = event.dst.substr (3);
        // this.arr[rob].write (event.res, event.age);
        let rob = event.dst.substr (3);
        this.arr[rob].write (event.res, event.age);
//        this.prevEvent = event;
    }

    if (event.kind == 'squash') {
	console.log (`In squash: start: ${this.start}, event:i_num: ${event.i_num}`);
	this.rat.notify(event);

	let flag_rob = 0, t_end = 0;
	for (let i = this.start; i <= this.end; ++i) {
	    if (this.arr[i].instr_num >= event.i_num) {
		console.log (`Squashing: i_num: ${this.arr[i].instr_num}`);
		this.arr[i].done = true;

		if (flag_rob == 0) {
		    t_end = i;
		    flag_rob = 1;
		}
	    }
	}

	console.log (`start's instr_num is ${this.arr[this.start].instr_num}`);
	for (let i = this.start; i <= this.end; ++i) {

	    if (this.arr[i].instr_num == event.i_num) {
		console.log ('event match');
		console.log (`done is ${this.arr[i].done}: i is: ${i}`);
	    }
	}

	if (flag_rob == 1)
	    this.end = t_end;

        // if (!this.arr[this.start].done) {
        //     this.end = this.start;
        // } else {
        //     for (let i = this.start; i <= this.end; ++i) {
        // 	// this.end can never be less than this.start, as i > start always.
        //     // Todo: Change logic to handle circular queue
        // 	if (!this.arr[i].done) {
        // 	    this.end = i - 1;
        // 	    break;
        // 	}
        //     }

	//     // if (this.end == this.start) {
	//     // 	this.end += 1;
	//     // }
        // }
    }

    if (event.kind == 'break_instr') {

	for (let i = this.start; i <= this.end; ++i) {
	    if (this.arr[i].instr_num == event.i_num) {
		this.arr[i].done = true;
		break;
	    }
	}
    }
};
