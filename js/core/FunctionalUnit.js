function FunctionalUnitElement (op, c2e) {
    this.free = true;

    // c2e stores the cycles needed to execute the operation.
    this.c2e = c2e;
    this.op = op;

    // Lambda functions according to the operation.
    if (op == 'add') {
        this.f = (a,b) => a+b;
    } else if (op == 'mul') {
        this.f = (a,b) => a*b;
    } else if (op == 'div') {
        this.f = (a,b) => a/b;
        this.exception_check = function (a, b) {
            if (b == 0) {
                return new Exception ('divide by 0');
            }
        }
    } else if (op == 'sub') {
    	this.f = (a, b) => a-b;
    } else if (op == 'beq') {
	this.f = (a, b) => a-b;
	this.exception_check = function (a, b) {
	    if (a == b) {
		return new Exception ('not equal');
	    }
	}
    }
    if (this.f == undefined) {
        console.error ('fu lambda not resolved');
    }
}
FunctionalUnitElement.prototype.isFree = function () {return this.free;}
FunctionalUnitElement.prototype.push = function (instr_num, dst, src1, src2, age) {
    this.src1 = src1;
    this.src2 = src2;
    this.dst = dst;
    this.age = age;
    this.when = global_clk;
    this.free = false;
    this.elapsed = 0;
    this.instr_num = pc;
}
FunctionalUnitElement.prototype.execute = function () {
    if (!this.free) {
        if (this.when == global_clk) return undefined; // Don't start same cycle.
        if (this.computed) {
            // If already computed, but not broadcasted, return the computed result.
            return {
                res : this.res,
                age : this.age,
            };
        }

	if (this.elapsed == Number(this.c2e)) {

            if (this.exception_check && this.op == 'beq') {
                let e = this.exception_check (this.src1, this.src2);
		console.log (`Exception check for ${this.op}`);
                if (e != undefined) {
		    console.log(`Jump is ${this.dst}`);
                    this.computed = true;
                    this.res = e;
                    return {
                        res : e,
                        age : this.age,

            			// Getting the instruction number of the 'break'
            			i_num: this.instr_num,

            			// Setting jump to number of instructions to jump.
            			jump : this.dst,
                    };
                }
            } else if (this.exception_check && this.op == 'div') {
                let e = this.exception_check (this.src1, this.src2);
                if (e != undefined) {
                    this.computed = true;
                    this.res = e;
                    return {
                        res : e,
                        age : this.age
                    };
                }
            }

	    // Ex: start at 2, finish at 3, write at 4
	    // console.error (`${this.op}, ${this.c2e}, ${this.elapsed}, ${this.elapsed == Number (this.c2e)+1}`);
	    // Account for the delay (time to execute) of the operation.
            let res = this.f (this.src1, this.src2);
            this.computed = true;
            this.res = res;
            // console.error ('its time');
            return {
                res : res,
                age : this.age,
            };
        }
    }
    this.elapsed++;
}
FunctionalUnitElement.prototype.freeUp = function () {
    this.free = true;
    this.computed = false;
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
FunctionalUnit.prototype.push = function (instr_num, op, dst, src1, src2, age) {
    for (let slot of this.arr) {
        if (slot.op == op) {
	    // We have different FU's for each operand.
            if (slot.free) {
                slot.push (instr_num, dst, src1, src2, age);
                return true;
            }
        }
    }
    return false;
}
FunctionalUnit.prototype.execute = function () {
    // On a single cycle, executing all the FU's parallelly.
    let to_write;
    for (let slot of this.arr) {
        let res = slot.execute ();

	// If execution is completed in the functional unit, broadcast via CDB.

	// Only when there is an exception, res will contain i_num and jump elements.
        if (res != undefined) {
            if (to_write == undefined) {
                to_write = {
                    res : res.res,
                    slot : slot,
                    age : res.age,
		    i_num: res.i_num,
		    jump: res.jump,
                };
            } else {
		//todo: block: shouldn't it be less than: preference to older age?
                if (to_write.age > res.age) {
                    to_write = {
                        res : res.res,
                        slot : slot,
                        age : res.age,
			i_num: res.i_num,
			jump: res.jump,
                    };
                }
            }
        }
    }
    // Only 1 priority broadcast per cycle
    if (to_write != undefined) {
        to_write.slot.freeUp ();
	console.log(`inum: ${to_write.i_num}`);

	// Only for exceptions, i_num is present in to_write.
	if (to_write.i_num == undefined) {
		console.log('broadcasting msgs'),
            this.cdb.notify ({
		kind : 'broadcast',
		res : to_write.res,
		dst : to_write.slot.dst,
		age : to_write.age
            });
	} else if (to_write.jump != undefined){
	    this.cdb.notify ({
		kind : 'squash',
		i_num: to_write.i_num,
	    });
	    if (to_write.jump == undefined) {
		console.error('jump error');
	    }

	    // In cycle x, squash is broadcasted.
	    // In cycle x + 1, pc will start from taken branch instruction
	    console.log (`PC before: ${pc}`);
	    pc = to_write.i_num + to_write.jump;
	    console.log (`now PC is ${pc}`);
	}
        // console.error ('braodcasted');
    } else {
        // console.error ('no broadcast');
    }
}
FunctionalUnit.prototype.tick = function () {
    this.execute ();
}
