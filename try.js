let global_clk = 0;

function Table (cols) {
    this.cols = cols;
    this.el = document.createElement ('table');
}
Table.prototype.addRow = function () {
    if (arguments.length != this.cols) {
        console.error ('#cols != #args');
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
Table.prototype.modifyRow = function (id) {
    if (arguments.length-1 != this.cols) {
        console.error ('#cols != #args');
    } else {
        let cells = this.el.rows[id].cells;
        for (let i = 0; i < this.cols; ++i) {
            cells[i].innerHTML = arguments[i+1];
        }
    }
}
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
ROB_Element.prototype.write  = function (val) {
    this.val = val;
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
        this.arr[this.start%this.capacity].done = true;
        this.start++;
        // this.registerFile.notify (event);
        this.rat.notify (event); // RAT notifies the registerFile
    }
}

function RAT (capacity, registerFile) {
    this.capacity = capacity;
    this.arr = new Array (capacity, undefined);
    this.registerFile = registerFile;
}
RAT.prototype.get = function (p) {
    if (this.arr[p] === undefined) {
        return this.registerFile[p];
    }
    return this.arr[p];
}
RAT.prototype.set = function (p, v) {this.arr[p] = v;}
RAT.prototype.notify = function (event) {
    if (event.kind == 'ROB_Commit') {
        this.registerFile[event.reg] = event.res;
        this.arr[event.reg] = undefined;
    }
};

let OC = { // opcodes enum
    ADD : 1,
};

function RS_Element (num, op, dst, operand1, operand2) {
    this.num = num;
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
    if (event.kind == 'result') {
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
}

function RS (slots, fu) {
    this.slots = slots;
    this.fu = fu;
    this.arr = new Array (slots);
    // this.arr.fill ();
    for (let i = 0; i < slots; ++i) {
        this.arr[i] = new RS_Element (i, 'add');
    }
    // this.table = new Table (3);
}
RS.prototype.push = function (dst, src1, src2) {
    // handle no slot free
    for (let el of this.arr) {
        if (el.discard) {
            el.set (dst, src1, src2);
            break;
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
    for (let slot of this.arr) {
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
        if (global_clk-this.start_clk == this.c2e) {
            let res = this.f (this.src1, this.src2);
            this.free = true;
            return res;
        }
        this.start_clk++;
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
    for (let slot of this.arr) {
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

function CDB (rs, rob) {
    this.rs = rs;
    this.rob = rob;
}
CDB.prototype.notify = function (event) {
    this.rs.notify (evt);
    this.rob.notify (evt);
}

function Chip (instr) {
    this.instrq = instr;
    this.ip = 0;
    this.FP_Registers = new RegisterFile (32);
    this.cdb = new CDB (rs, this.FP_Registers)
    this.fu = new FunctionalUnit (3, 2, this.cdb);
    this.rs = new RS (3, this.fu);
    this.rat = new RAT (32, this.FP_Registers);
    this.rob = new ROB ();
}
Chip.prototype.run = function () {
    let complete = false;
    for (;!complete && (global_clk < 30);global_clk++) {
        renderRegisterFile (this.FP_Registers);
        renderRS (this.rs);
        // ISSUE
        {
            if (this.ip <= this.instrq.length) {
                // complete = true;
                // break;
                let op = this.instrq[this.ip];
                if (op == OC.ADD) {
                    let dest = this.instrq[++this.ip];
                    let src1 = this.instrq[++this.ip],
                    src2 = this.instrq[++this.ip];
                    let act1 = this.rat.get (src1),
                    act2 = this.rat.get (src2);
                    let robEntry = this.rob.insert (dest);
                    let id = this.rs.push ('add', act1, act2);
                    this.rs.push ('add', robEntry, act1, act2);
                    this.rat.set (dest, robEntry);
                }
            }
        }

        // DISPATCH
        this.rs.dispatch ();
        // for (let rs in this.rs) {
        // }

        // BROADCAST
        this.fu.execute (this.cdb);
        // for (let rs in this.rs) {
        // }
    }
    console.log ("completed");
}

var chip = new Chip ([OC.ADD, 3, 1, 2]);
chip.run ();
