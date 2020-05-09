function RS_Element (op, dst, operand1, operand2) {
    this.op = op;
    this.dst = dst;
    this.operand1 = operand1;
    this.operand2 = operand2;
    this.discard = true;
    this.ready = false;
}
RS_Element.prototype.isReady = function () {
    return !this.discard && this.ready;
}
RS_Element.prototype.notify = function (event) {
    if (event.kind == 'broadcast') {
        if (!this.discard) {
            if (this.operand1 == event.dst) this.operand1 = event.res;
            if (this.operand2 == event.dst) this.operand2 = event.res;
            this.ready = !isNaN (this.operand1) && !isNaN (this.operand2);
        }
    }
}
RS_Element.prototype.set = function (dst, src1, src2) {
    this.dst = dst;
    this.operand1 = src1;
    this.operand2 = src2;
    this.discard = false;
    this.ready = !isNaN (this.operand1) && !isNaN (this.operand2);
}

function RS (config, fu) {
    this.fu = fu;
    this.arr = [];
    for (let rs in config) {
        for (let i = 0; i < config[rs].count; i++) {
            this.arr.push (new RS_Element (rs));
        }
    }
    this.slots = this.arr.length;
}

// returns true or false
RS.prototype.push = function (op, dst, src1, src2) {
    // handle no slot free
    for (let rs of this.arr) {

	// nitpick: todo: maybe we should first check if RS is for the op, then
	// check whether it's free or not. We can save some time here.
        if (rs.discard) {
            if (rs.op == op) {
                rs.set (dst, src1, src2);
                return true;
            }
        }
    }
    return false;
}
RS.prototype.dispatch = function () {
    for (let i = 0; i < this.slots; ++i) {
        if (this.arr[i].isReady ()) {
	    // If push fails, it would be because FU for that operand is not free.
            if (this.fu.push (
                this.arr[i].op,
                this.arr[i].dst,
                this.arr[i].operand1,
                this.arr[i].operand2
            )) {
                this.arr[i].discard = true;
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
