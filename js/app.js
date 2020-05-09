let global_clk = 0;

let OC = { // opcodes enum
    ADD : 1,
    DIV : 2,
};

var chip;
var btn = document.getElementById ('next');
btn.onclick = function () {

    // If processor has not yet started or reset
    // Configure the processor & add instructions to be executed.
    if (!chip || reset) {
        chip_config = config;
        config.instr = [
            OC.ADD, 2, 0, 1,
            OC.ADD, 3, 2, 1,
            OC.DIV, 2, 0, 1,
        ];
        chip = new Chip (chip_config);
    }
    chip.run ();
    reset = false;
}
