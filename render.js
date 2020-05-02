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
        table.modifyRow (1, el.op, el.dst, el.operand1, el.operand2, el.discard);
    }
}

function renderRegisterFile (rf) {
    let el = document.getElementById('RegisterFile');
    let table = new Table (2);
    for (let i = 0; i < rf.capacity; ++i) {
        table.addRow (i, `<input value = '${rf.arr[i]}'></input>`);
    }
    el.appendChild (table.el);
}
