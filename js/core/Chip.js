function Chip (config) {
    this.instrq = config.instr;
    // TODO: Instead of '0' as magic number use macro.
    this.ip = 0;
    // TODO: Instead of '32' as magic number use macro.
    this.FP_Registers = new RegisterFile (32);
    this.cdb = new CDB (this.rs, this.FP_Registers)
    this.fu = new FunctionalUnit (config.fu_config, this.cdb);
    this.rs = new RS (config.rs_config, this.fu);
    // TODO: Instead of '32' as magic number use macro.
    this.rat = new RAT (32, this.FP_Registers);
    this.rob = new ROB (this.FP_Registers, this.rat);
    this.issue_unit = new IssueUnit (this.instrq, this.rs, this.rat, this.rob);

    this.cdb.rs = this.rs;
    this.cdb.rob = this.rob;
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
    renderROB (this.rob);
}
