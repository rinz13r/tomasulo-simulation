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
    this.arr[0] = 8;
    this.arr[1] = 7;
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
        this.arr[this.start%this.capacity].done = true;
        this.start++;
        // this.registerFile.notify (event);
        this.rat.notify (event); // RAT notifies the registerFile
    }
}
ROB.prototype.notify = function (event) {
    if (event.kind == 'broadcast') {
        let rob = event.dst.substr (3);
        this.arr[rob].write (event.res);
    }
};

function RAT (capacity, registerFile) {
    this.capacity = capacity;
    this.arr = new Array (capacity);
    this.arr.fill (undefined);
    this.registerFile = registerFile;
}
RAT.prototype.get = function (p) {
    if (this.arr[p] === undefined) {
        return this.registerFile.get (p);
    }
    return this.arr[p];
}
RAT.prototype.set = function (p, v) {this.arr[p] = v;}
RAT.prototype.notify = function (event) {
    if (event.kind == 'ROB_Commit') {
        this.registerFile.set (event.reg, event.res);
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

function RS (slots, fu) {
    this.slots = slots;
    this.fu = fu;
    this.arr = new Array (slots);
    // this.arr.fill ();
    for (let i = 0; i < slots; ++i) {
        this.arr[i] = new RS_Element (i, 'add');
    }
}
RS.prototype.push = function (op, dst, src1, src2) {
    // handle no slot free
    for (let el of this.arr) {
        if (el.discard) {
            if (el.op == op) {
                el.set (dst, src1, src2);
                return true;
            }
        }
    }
    return false;
}
RS.prototype.dispatch = function () {
    for (let i = 0; i < this.slots; ++i) {
        if (this.arr[i].isReady ()) {
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
FunctionalUnitElement.prototype.execute = function () {
    if (!this.free) {
        if (global_clk-this.start_clk == this.c2e) {
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

function CDB (rs, rob) {
    this.rs = rs;
    this.rob = rob;
}
CDB.prototype.notify = function (event) {
    this.rs.notify (event);
    this.rob.notify (event);
}

function IssueUnit (instrq, rs, rat, rob) {
    this.instrq = instrq;
    this.rs = rs;
    this.rat = rat;
    this.rob = rob;
    this.ip = 0;
    this.failed_issue = false;
}
IssueUnit.prototype.issue = function () {
    if (this.ip >= this.instrq.length-1) {
        return;
    }
    let robEntry, act1, act2, dest, op;
    if (this.failed_issue) {
        dest = this.fail_info.dest;
        robEntry = this.fail_info.robEntry;
        act1 = this.fail_info.act1;
        act2 = this.fail_info.act2;
        op = this.fail_info.op;
    } else {
        let next = this.instrq[this.ip++];
        if (next == OC.ADD) {
            dest = this.instrq[this.ip++];
            let src1 = this.instrq[this.ip++],
                src2 = this.instrq[this.ip++];
            act1 = this.rat.get (src1), act2 = this.rat.get (src2);

            robEntry = this.rob.insert (dest);
        }
    }
    if (!this.rs.push ('add', robEntry, act1, act2)) {
        this.fail_info = {
            dest : dest,
            robEntry : robEntry,
            src1 : act1,
            src2 : act2,
            op   : 'add',
        };
        this.failed_issue = true;
    } else {
        this.failed_issue = false;
        this.rat.set (dest, robEntry);
    }
    console.log (`ip=${this.ip}`)
}

function Chip (instr) {
    this.instrq = instr;
    this.ip = 0;
    this.FP_Registers = new RegisterFile (32);
    this.cdb = new CDB (this.rs, this.FP_Registers)
    this.fu = new FunctionalUnit (3, 2, this.cdb);
    this.rs = new RS (3, this.fu);
    this.cdb.rs = this.rs;
    this.rat = new RAT (32, this.FP_Registers);
    this.rob = new ROB (this.FP_Registers, this.rat);
    this.cdb.rob = this.rob;
    this.issue_unit = new IssueUnit (instr, this.rs, this.rat, this.rob);
}
Chip.prototype.run = function () {
    // let complete = false;
    // for (;!complete && (global_clk < 30);global_clk++) {

        this.issue_unit.issue ();
        this.rs.dispatch ();
        this.fu.execute (this.cdb);
        this.rob.commit ();

        global_clk++;
        renderRegisterFile (this.FP_Registers);
        renderRS (this.rs);
}

var chip = new Chip ([
    OC.ADD, 2, 0, 1,
    OC.ADD, 3, 2, 1,
]);
var btn = document.getElementById ('next');
btn.onclick = function () {
    chip.run ();
}
