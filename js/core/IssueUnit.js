function IssueUnit (instrq, rs, rat, rob) {
    this.instrq = instrq;
    this.rs = rs;
    this.rat = rat;
    this.rob = rob;
    this.ip = 0;
    this.failed_issue = false;
}
IssueUnit.prototype.issue = function () {

    // If all instructions are executed, do nothing and return
    if (this.ip >= this.instrq.length-1) {
        return;
    }

    let robEntry, act1, act2, dest, op;

    // If adding to instruction to RS fails in previous cycle, try
    // again till RS becomes free. (Essentially stall till RS is free)
    if (this.failed_issue) {
        dest = this.fail_info.dest;
        robEntry = this.fail_info.robEntry;
        act1 = this.fail_info.act1;
        act2 = this.fail_info.act2;
        op = this.fail_info.op;
    } else {
        let next = this.instrq[this.ip++];
        if (next == OC.ADD) {
            op = 'add';
            dest = this.instrq[this.ip++];
            let src1 = this.instrq[this.ip++],
                src2 = this.instrq[this.ip++];

	    // Rename the registers
            act1 = this.rat.get (src1), act2 = this.rat.get (src2);

	    // Create an entry in the ROB table

	    // BLOCK: shouldn't we also be renaming the destination register
	    // & then add to ROB?
            robEntry = this.rob.insert (dest);
        } else if (next == OC.DIV) {
            op = 'div';
            dest = this.instrq[this.ip++];
            let src1 = this.instrq[this.ip++],
                src2 = this.instrq[this.ip++];
            act1 = this.rat.get (src1), act2 = this.rat.get (src2);
            robEntry = this.rob.insert (dest);
        }
    }

    // Reservation station is not empty (or) adding to it fails.
    if (!this.rs.push (op, robEntry, act1, act2)) {
        this.fail_info = {

	    // todo: nitpick: we don't actually need a 'dest' here, as robEntry is
	    // sufficient.
            dest : dest,
            robEntry : robEntry,
            src1 : act1,
            src2 : act2,
            op   : op,
        };
        this.failed_issue = true;
    } else {
        this.failed_issue = false;
        this.rat.set (dest, robEntry);
    }
    console.log (`ip=${this.ip}`)
}
