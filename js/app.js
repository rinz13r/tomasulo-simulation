let global_clk = 0;
let reset = false;
let global_instr = [];
let pc = 0;
let OC = { // opcodes enum
    ADD : 1,
    SUB : 2,
    DIV : 3,
    MUL : 4,
    BEQ : 5,
};

var chip, times = 1;

function run () {

    // If processor has not yet started or reset
    // Configure the processor & add instructions to be executed.    
    if (!chip || reset) {
        let config = getConfig ();
        chip = new Chip (config);
        global_clk = 0;
	pc = 0;
    }
    for (let i = 0; i < times; i++) {
        chip.run ();
    }

    renderRegisterFile (chip.FP_Registers);
    renderRS (chip.rs);
    renderROB (chip.rob);
    document.getElementById ("cycle").innerHTML = global_clk;

    reset = false;
}

function renderAll () {

}
