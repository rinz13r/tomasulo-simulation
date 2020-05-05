function FunctionalUnitElement (op, c2e) {
    this.free = true;
    this.c2e = c2e;
    this.op = op;
    if (op == 'add') {
        this.f = (a,b) => a+b;
    } else if (op == 'mult') {
        this.f = (a,b) => a*b;
    } else if (op == 'div') {
        this.f = (a,b) => a/b;
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
            this.arr.push (new FunctionalUnitElement (fu, config[fu].delay));
        }
    }
}
FunctionalUnit.prototype.push = function (op, dst, src1, src2) {
    for (let slot of this.arr) {
        if (slot.op == op) {
            if (slot.free) {
                slot.push (dst, src1, src2);
                return true;
            }
        }
    }
    return false;
}
FunctionalUnit.prototype.execute = function () {
    for (let slot of this.arr) {
        let res = slot.execute ();

	// If execution is completed in the functional unit, broadcast.
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
