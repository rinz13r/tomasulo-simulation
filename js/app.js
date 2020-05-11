let global_clk = 0;

let OC = { // opcodes enum
    ADD : 1,
    SUB : 2,
    DIV : 3,
    MUL : 4,
};

var chip, times = 1;
var btn = document.getElementById ('next');
var btn5 = document.getElementById ('next5');
btn5.onclick = function () {
    times = 5;
    btn.click ();
    times = 1;
}
btn.onclick = function () {

    // If processor has not yet started or reset
    // Configure the processor & add instructions to be executed.
    if (!chip || reset) {
        for (let rs of RSs) {
            config['rs_config'][rs]['count'] = 5;
            config['fu_config'][rs]['count'] = 5;
        }
        config['fu_config']['add']['delay'] = 1;
        config['fu_config']['sub']['delay'] = 1;
        config['fu_config']['mul']['delay'] = 10;
        config['fu_config']['div']['delay'] = 40;
        chip_config = config;
        config.instr = [
            ['div', 2, 3, 4],
            ['mul', 1, 5, 6],
            ['add', 3, 7, 8],
            ['mul', 1, 1, 3],
            ['sub', 4, 1, 5],
            ['add', 1, 4, 2],
        ];
        chip = new Chip (chip_config);
        global_clk = 0;
    }
    for (let i = 0; i < times; i++) {
        chip.run ();
    }
    renderTimeline ();
    document.getElementById ('clock').innerHTML = global_clk;
    reset = false;
}
