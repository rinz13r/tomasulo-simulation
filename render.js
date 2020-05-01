function renderFunctionalUnit (fu) {
    if (!this.table) {
        this.table = new Table ()
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
