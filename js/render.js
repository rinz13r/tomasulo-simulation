function renderRS  (rs) {
    let mtbl = document.getElementById ('rstbl');
    let tbody = mtbl.getElementsByTagName ('tbody')[0];
    tbody.remove ();
    let tbl = document.createElement ('tbody');
    for (let i = 0; i < rs.slots; ++i) {
        let el = rs.arr[i];
        let row = tbl.insertRow (-1);
	let cell0 = row.insertCell (0); cell0.innerHTML = el.instr_num;
        let cell1 = row.insertCell (1); cell1.innerHTML = i;
        let cell2 = row.insertCell (2); cell2.innerHTML = el.op;
        let cell3 = row.insertCell (3); cell3.innerHTML = el.dst;
        let cell4 = row.insertCell (4); cell4.innerHTML = el.operand1;
        let cell5 = row.insertCell (5); cell5.innerHTML = el.operand2;
        let cell6 = row.insertCell (6); cell6.innerHTML = el.discard;
    }
    mtbl.appendChild (tbl);
}

function renderRegisterFile (rf) {
    let mtbl = document.getElementById ('rftbl');
    let tbody = mtbl.getElementsByTagName ('tbody')[0];
    tbody.remove ();
    let tbl = document.createElement ('tbody');
    for (let i = 0; i < rf.capacity; ++i) {
        let row = tbl.insertRow (-1);
        let cell0 = row.insertCell (0); cell0.innerHTML = i;
        let cell1 = row.insertCell (1); cell1.innerHTML = rf.get (i);
    }
    mtbl.appendChild (tbl);
}

function renderROB (rob) {
    let mtbl = document.getElementById ('robtbl');
    let tbody = mtbl.getElementsByTagName ('tbody')[0];
    tbody.remove ();
    let tbl = document.createElement ('tbody');
    for (let i = 0; i < rob.capacity; ++i) {
        let text = "";
        if (i == rob.start) text = "START";
        else if (i == rob.end) text = "END";
        if (i == rob.start && i == rob.end) {
            text = "START, END"
        }
        let row = tbl.insertRow (-1);
	let cell0 = row.insertCell (0); cell0.innerHTML = rob.arr[i].instr_num;
        let cell1 = row.insertCell (1); cell1.innerHTML = text;
        let cell2 = row.insertCell (2); cell2.innerHTML = rob.arr[i].reg;
        let cell3 = row.insertCell (3); cell3.innerHTML = rob.arr[i].val;
        let cell4 = row.insertCell (4); cell4.innerHTML = rob.arr[i].done;
    }
    mtbl.appendChild (tbl);
}

function renderTimeline (timeline) {}
