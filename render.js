function renderRS  (rs){
    if (!renderRS.table) {
        renderRS.table = new Table (5);
        let table = renderRS.table;
        for (let i = 0; i < rs.slots; ++i) {
            let el = rs.arr[i];
            table.addRow (el.op, el.dst, el.operand1, el.operand2, el.discard);
        }
        let el = document.getElementById ('rs');
        el.appendChild (table.el);
    }
    let table = renderRS.table;
    for (let i = 0; i < rs.slots; ++i) {
        let el = rs.arr[i];
        table.modifyRow (i, el.op, el.dst, el.operand1, el.operand2, el.discard);
    }
}

function renderRegisterFile (rf) {
    if (!renderRegisterFile.table) {
        let el = document.getElementById('RegisterFile');
        renderRegisterFile.table = new Table (2);
        let table = renderRegisterFile.table;
        for (let i = 0; i < rf.capacity; ++i) {
            table.addRow (i, `${rf.arr[i]}`);
        }
        el.appendChild (table.el);
    }
    let table = renderRegisterFile.table;
    for (let i = 0; i < rf.capacity; ++i) {
        // let el = rf.arr[i];
        table.modifyRow (i, i, rf.get (i));
    }
}
