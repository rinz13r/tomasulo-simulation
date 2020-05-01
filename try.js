let global_clk = 0;
function Table (cols) {
    this.cols = cols;
    this.el = document.createElement ('table');
}
Table.prototype.addRow = function () {
    if (arguments.length != this.cols) {
        console.err ('#cols != #args');
    } else {
        let row = document.createElement ('tr');
        for (let i = 0; i < this.cols; ++i) {
            let col = document.createElement ('td');
            col.innerHTML = arguments[i];
            row.appendChild (col);
        }
        this.el.appendChild (row);
    }
};

function RegisterFile (capacity) {
    this.capacity = capacity;
    this.arr = new Array (capacity);
    this.arr.fill (0);
}
RegisterFile.prototype.get = function (p) {
    return this.arr[p];
}
RegisterFile.prototype.set = function (p, v) {
    this.arr[p] = v;
}

function ROB_Element () {
    this.done = false;
}
ROB_Element.prototype.populate = function (reg) {
    this.reg = reg;
}
// ROB_Element.prototype.write  = funciton (re))

function ROB () {
    this.arr = new Array (100);
    this.arr.forEach (x => new  ROB_Element ());
    this.capacity = 100;
    this.commit = 0;
    this.issue = 0;
}
ROB.prototype.insert = function (reg) {
    this.arr[this.issue%this.capacity].populate (reg);
}

function RAT (capacity, fp_reg) {
    this.capacity = capacity;
    this.arr = new Array (capacity, undefined);
    this.fp_reg = fp_reg;
}
RAT.prototype.get = function (p) {
    if (this.arr[p] === undefined) {
        return this.fp_reg[p];
    }
    return this.arr[p];
}
RAT.prototype.set = function (p, v) {this.arr[p] = v;}

let OC = { // opcodes enum
    ADD : 1,
};

function RS_Element (num, op, operand1, operand2) {
    this.num = num;
    this.op = op;
    this.operand1 = operand1;
    this.operand2 = operand2;
    this.discard = true;
    this.ready = false;
}
RS_Element.prototype.isReady = function () {
    return !this.discard && this.ready;
}
RS_Element.prototype.notify = function (event) {
    if (event.kind == 'result') {
        if (!this.discard) {
            if (this.operand1 == event.dst) this.operand1 = event.res;
            if (this.operand2 == event.dst) this.operand2 = event.res;
            this.ready = (typeof operand1 == "number" && typeof operand2 == "number");
        }
    }
}

function RS (slots, func_unit) {
    this.slots = slots;
    this.arr = new Array (slots);
    this.arr.fill ();
    for (let i = 0; i < slots; ++i) {
        this.arr[i] = new RS_Element (i);
    }
    this.table = new Table (3);
}
RS.prototype.push = function (op, src1, src2) {
    // handle no slot free
    for (let el of this.arr) {
        if (el.discard) {
            el.set (op, src1, src2);
        }
    }
}
RS.prototype.dispatch = function () {
    for (let i = 0; i < this.slots; ++i) {
        if (this.arr[i].isReady ()) {
            this.fu.push (
                this.arr[i].op,
                `RS${i}`,
                this.arr[i].operand1,
                this.arr[i].operand2
            );
            this.arr[i].discard = true;
            break;
        }
    }
}
RS.prototype.notify = function (event) {
    for (let slot in this.arr) {
        slot.notify (event);
    }
}

function FunctionalUnitElement (op, c2e, lambda) {
    this.free = true;
    this.f = lambda;
    this.c2e = c2e;
    this.op = op;
}
FunctionalUnitElement.prototype.isFree = function () {return this.free;}
FunctionalUnitElement.prototype.push = function (dst, src1, src2) {
    this.src1 = src1;
    this.src2 = src2;
    this.dst = dst;
    this.start_clk = global_clk;
    this.free = false;
}
FunctionalUnitElement.prototype.tick = function () {
    this.start_clk++;
}
FunctionalUnitElement.prototype.execute = function () {
    if (!this.free) {
        if (global_clk-this.startclk == this.c2e) {
            let res = this.f (this.src1, this.src2);
            this.free = true;
            return res;
        }
    }
}

function FunctionalUnit (adds, mults, cdb) {
    this.cdb = cdb;
    this.arr = new Array ();
    for (let i = 0; i < adds; i++) {
        this.arr.push (new FunctionalUnitElement ('add', 2, (a, b) => a+b));
    }
    for (let i = 0; i < mults; i++) {
        this.arr.push (new FunctionalUnitElement ('mult', 2, (a, b) => a*b));
    }
}
FunctionalUnit.prototype.push = function (op, dst, src1, src2) {
    for (let slot in this.arr) {
        if (slot.op == op) {
            if (slot.free) {
                slot.push (dst, src1, src2);
                break;
            }
        }
    }
}
FunctionalUnit.prototype.execute = function () {
    for (let slot in this.arr) {
        let res = slot.execute ();
        if (res != undefined) {
            this.cdb.notify ({
                kind : 'result',
                res : res,
                dst : this.arr.dst,
            });
        }
    }
}

function CDB (rs_list, fp_registers) {
    this.rs = rs_list;
    this.FP_Regsiters = fp_registers;
}
CDB.prototype.notify = function (event) {
    for (let rs in this.rs) {
        rs.notify (evt);
    }
}

function Chip (instr) {
    this.instrq = instr;
    this.ip = 0;
    this.FP_Registers = new RegisterFile (32);
    this.fu_add = new FunctionalUnit (function (a, b) {return a + b;});
    this.rs_add = new RS (3);
    this.rat = new RAT (32, this.FP_Registers);
}
Chip.prototype.run = function () {
    let complete = true;
    // this.FP_Registers.render ();
    renderRegisterFile (this.FP_Registers);
    for (;!complete;global_clk++) {
        // ISSUE
        {
            if (this.ip == this.instrq.length) {
                complete = true;
                break;
            }
            let op = this.intrq[this.ip];
            if (op == OC.ADD) {
                let dest = this.instrq[++this.ip];
                let src1 = this.instrq[++this.ip],
                    src2 = this.instrq[++this.ip];
                let act1 = this.rat.get (src1),
                    act2 = this.rat.get (src2);
                let id = this.rs_add.push (
                    act1,
                    (act1 == undefined),
                    act2,
                    (act2 == undefined),
                );
                this.rat.set (dest, "RS"+id);
            }
        }

        // DISPATCH
        for (let rs in this.rs) {
            rs.dispatch ();
        }

        // BROADCAST
        for (let rs in this.rs) {
            rs.execute_and_broadcast (this.cdb);
        }
    }
    console.log ("completed");
}

var chip = new Chip ([]);
chip.run ();
