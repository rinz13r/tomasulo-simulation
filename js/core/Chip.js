function Chip (config) {
    this.instrq = config.instr;
    // TODO: Instead of '0' as magic number use macro.
    this.ip = 0;
    // TODO: Instead of '32' as magic number use macro.
    // TODO: May be 32 is high for physical registers
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

    global_clk++;
    this.fu.execute (); // Will write to the CDB (if possible), CDB notifes RAT,ROB
    this.issue_unit.issue ();
    this.rs.dispatch (); // Capture new values from the CDB and dispatch
    this.rob.commit ();

    pc += 1;
}
