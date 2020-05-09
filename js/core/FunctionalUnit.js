function FunctionalUnitElement (op, c2e) {
    this.free = true;

    // c2e stores the cycles needed to execute the operation.
    this.c2e = c2e;
    this.op = op;

    // Lambda functions according to the operation.
    if (op == 'add') {
        this.f = (a,b) => a+b;
    } else if (op == 'mult') {
	// nitpick: todo: probably mult -> mul
        this.f = (a,b) => a*b;
    } else if (op == 'div') {
        this.f = (a,b) => a/b;
    } else if (op == 'sub') {
	this.f = (a, b) => a-b;
    }
    if (this.f == undefined) {
        console.error ('fu lambda not resolved');
    }
}
FunctionalUnitElement.prototype.isFree = function () {return this.free;}
FunctionalUnitElement.prototype.push = function (dst, src1, src2) {
    this.src1 = src1;
    this.src2 = src2;
    this.dst = dst;
    this.start_clk = global_clk;
    this.free = false;
}
FunctionalUnitElement.prototype.execute = function () {
    if (!this.free) {

	// Account for the delay (time to execute) of the operation.
        if (global_clk-this.start_clk == this.c2e) {
            let res = this.f (this.src1, this.src2);
            this.free = true;
            return res;
        }
    }
}

function FunctionalUnit (config, cdb) {
    this.cdb = cdb;
    this.arr = new Array ();
    for (let fu in config) {
        for (let i = 0; i < config[fu].count; i++) {
	    // get the dealy for each operation from the setting. Check. TODO
            this.arr.push (new FunctionalUnitElement (fu, config[fu].delay));
        }
    }
}
FunctionalUnit.prototype.push = function (op, dst, src1, src2) {
    for (let slot of this.arr) {
        if (slot.op == op) {
	    // We have different FU's for each operand. 
            if (slot.free) {
                slot.push (dst, src1, src2);
                return true;
            }
        }
    }
    return false;
}
FunctionalUnit.prototype.execute = function () {
    // On a single cycle, executing all the FU's parallelly.
    for (let slot of this.arr) {
        let res = slot.execute ();

	// If execution is completed in the functional unit, broadcast via CDB.
        if (res != undefined) {
            this.cdb.notify ({
                kind : 'broadcast',
                res : res,
                dst : slot.dst,
            });
            break; // Only 1 arbitrary broadcast per cycle
        }
    }
}
