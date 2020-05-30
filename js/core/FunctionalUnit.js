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
FunctionalUnitElement.prototype.push = function (instr_num, dst, src1, src2, age, jump) {
    this.src1 = src1;
    this.src2 = src2;
    this.dst = dst;
    this.age = age;
    this.when = global_clk;
    this.free = false;
    this.elapsed = 0;
    this.instr_num = instr_num;
    this.jump = jump;
    this.computed = false;
}
FunctionalUnitElement.prototype.execute = function () {
    if (!this.free) {
        if (this.when == global_clk) return undefined; // Don't start same cycle.
        if (this.computed) {
            // If already computed, but not broadcasted, return the computed result.
            return {
                res : this.res,
                age : this.age,
		i_num: this.instr_num,
            };
        }

	if (this.elapsed == Number(this.c2e)) {

            if (this.exception_check) {
                let e = this.exception_check (this.src1, this.src2);
		console.log (`Exception check for ${this.op}`);
		console.log (`e is ${e}`);
                if (e != undefined) {
                    this.computed = true;
                    this.res = e;
		    console.log (`inum is ${this.instr_num}`);
                    return {
                        res : e,
                        age : this.age,

			// Getting the instruction number of the 'break'
			i_num: this.instr_num,


			// Setting jump to number of instructions to jump.
			jump : this.jump,
                    };
                }
            }

	    // Ex: start at 2, finish at 3, write at 4
	    // console.error (`${this.op}, ${this.c2e}, ${this.elapsed}, ${this.elapsed == Number (this.c2e)+1}`);
	    // Account for the delay (time to execute) of the operation.
            let res = this.f (this.src1, this.src2);
            this.computed = true;
            this.res = res;
            console.error ('its time');
	    console.log (`res is ${this.res}, ${this.src1}, ${this.src2} ${this.op} ${this.instr_num}`);
            return {
                res : res,
                age : this.age,
		i_num: this.instr_num,
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
FunctionalUnit.prototype.push = function (instr_num, op, dst, src1, src2, age, jump) {
    for (let slot of this.arr) {
        if (slot.op == op) {
	    // We have different FU's for each operand.
            if (slot.free) {
                slot.push (instr_num, dst, src1, src2, age, jump);
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

	// If a slot is free, continue to next slot.
	if (slot.free) {
	    continue;
	}
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
//	debugger;
	//        to_write.slot.freeUp ();
	console.log(`inum: ${to_write.i_num}`);

	// Only for exceptions, i_num is present in to_write.
	//	if (to_write.i_num == undefined) {

	// todo: block: Right now, exception only possible for beq.
	if (to_write.slot.op != 'beq') {
	    to_write.slot.freeUp();
	    console.log('broadcasting msgs'),
            this.cdb.notify ({
		kind : 'broadcast',
		res : to_write.res,
		dst : to_write.slot.dst,
		age : to_write.age,
		i_num : to_write.slot.instr_num,
            });
	} else {

	    // i_num is only set for beq exception
	    if (to_write.i_num != undefined) {
		to_write.slot.freeUp();
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
		console.log (`jump is : ${to_write.jump}`)
		pc = to_write.jump;
		console.log (`now PC is ${pc}`);

		// Freeing up FunctionalUnit
		for (let slot of this.arr) {
		    if (slot.instr_num >= to_write.i_num) {
			slot.free = true;
			slot.freeUp();
		    }
		}
	    } else {
		this.cdb.notify ({
		    kind : 'break_instr',
		    i_num : to_write.slot.instr_num,
		});
		to_write.slot.freeUp();
	    }
	}
        // console.error ('braodcasted');
    } else {
        // console.error ('no broadcast');
    }
}
FunctionalUnit.prototype.tick = function () {
    this.execute ();
}
FunctionalUnit.prototype.notify = function (event) {
    for (let slot of this.arr) {
	if (slot.instr_num > event.i_num) {
	    slot.free = true;
	}
    }
}
