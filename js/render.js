function renderRS  (rs){
    if (!renderRS.table || reset) {
        if (reset && renderRS.table != undefined) {
            renderRS.table.el.remove ();
        }
        renderRS.table = new Table (5);
        let table = renderRS.table;
        let headers = ['Operation', 'dest', 'src1', 'src2', 'discard?'];
        for (let header of headers) {
            let th = document.createElement ('th');
            th.innerHTML = header;
            table.el.appendChild (th);
        }

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
    if (!renderRegisterFile.table || reset) {
        if (reset && renderRegisterFile.table != undefined) {
            renderRegisterFile.table.el.remove ();
        }
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

function renderROB (rob) {
    if (!renderROB.table || reset) {
        if (reset && renderROB.table != undefined) {
            renderROB.table.el.remove ();
        }
        let el = document.getElementById('ROB');
        renderROB.table = new Table (4);
        let table = renderROB.table;
        for (let i = 0; i < rob.capacity; ++i) {
            table.addRow ("", rob.arr[i].reg, rob.arr[i].val, rob.arr[i].done);
        }
        el.appendChild (table.el);
    }
    let table = renderROB.table;
    for (let i = 0; i < rob.capacity; ++i) {
        let text = "";
        if (i == rob.start) text = "START";
        else if (i == rob.end) text = "END";
        if (i == rob.start && i == rob.end) {
            text = "START, END"
        }
        table.modifyRow (i, text, rob.arr[i].reg, rob.arr[i].val, rob.arr[i].done);
    }
}
