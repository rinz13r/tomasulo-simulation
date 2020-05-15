function RS_Element (op, dst, operand1, operand2) {
    this.op = op;
    this.dst = dst;
    this.operand1 = operand1;
    this.operand2 = operand2;
    this.discard = true;
    this.ready = false;
    this.instr_num = -2;
}
RS_Element.prototype.isReady = function () {
    return !this.discard && this.ready; // && this.when != global_clk;
}
RS_Element.prototype.notify = function (event) {
    if (event.kind == 'broadcast') {
        if (!this.discard) {
            if (this.operand1 == event.dst) this.operand1 = event.res;
            if (this.operand2 == event.dst) this.operand2 = event.res;
            this.ready = !isNaN (this.operand1) && !isNaN (this.operand2);
        }
    }

    if (event.kind == 'squash') {
	if (this.instr_num > 0 && this.instr_num > event.i_num)
	    this.discard = true;
    }
}
RS_Element.prototype.set = function (instr_num, dst, src1, src2, age) {
    this.dst = dst;
    this.operand1 = src1;
    this.operand2 = src2;
    this.discard = false;
    this.age = age; // Priority of broadcast : oldest first
    this.ready = !isNaN (this.operand1) && !isNaN (this.operand2);
    this.when = global_clk;
    this.instr_num = instr_num;
}

function RS (config, fu) {
    this.fu = fu;
    this.arr = [];
    this.mapping = {}; // mapping b/w op and a list of it's corresponding RS_Elements
    console.error (config);
    for (let rs in config) {
        this.mapping[rs] = [];
        for (let i = 0; i < config[rs].count; i++) {
            let el = new RS_Element (rs);
            this.arr.push (el);
            this.mapping[rs].push (el);
        }
    }
    this.slots = this.arr.length;
    this.age = 1; // Essentially is the instruction number in the queue.
}

// returns true or false
RS.prototype.push = function (pc, op, dst, src1, src2) {
    try {
        for (let rs of this.mapping[op]) {
            if (rs.discard) {
                // let t = new Table (5, document.getElementById ('timeline'));
                // t.modifyCell (this.age, 1, global_clk);
                // t.modifyCell (this.age, 0, global_instr[this.age-1]);
                rs.set (pc, dst, src1, src2, this.age++);
                return true;
            }
        }

    } catch {
        console.error ("error: op=" , op);
    }
    return false;
}
RS.prototype.dispatch = function () {
    for (let rs in this.mapping) {
        let ready = {}
        for (let slot of this.mapping[rs]) {
            if (slot.isReady ()) {
                ready[slot.age] = slot; // All ages are distict
            }
        }
        for (let age in ready) {
            let slot = ready[age];
            if (this.fu.push (slot.instr_num, slot.op, slot.dst,
			      slot.operand1, slot.operand2, age)) {
                slot.discard = true;
                // let t = new Table (5, document.getElementById ('timeline'));
                // t.modifyCell (slot.age, 2, global_clk+1);
            } else { // FU is full.
                break;
            }
        }
    }
}
RS.prototype.notify = function (event) {
    for (let slot of this.arr) {
        slot.notify (event);
    }
}
RS.prototype.tick = function () {
    this.dispatch ();
}
