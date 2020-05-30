function makeSelect (options) {
    let select_el = document.createElement ('select');
    for (let op of options) {
        let op_el = document.createElement ('option');
        op_el.value = op;
        op_el.innerHTML = op;
        select_el.appendChild (op_el);
    }
    return select_el;
}
function addRow () {
    let op_select = makeSelect (['add', 'sub', 'div', 'mul', 'beq', 'load', 'store']);
    let regs = []; for (let i = 0; i < 32; i++) regs.push ('R'+i);
    let dest_select = makeSelect (regs);
    let src1_select = makeSelect (regs);
    let src2_select = makeSelect (regs);

    op_select.onchange = function (event) {
        let select_el = event.srcElement;
        if (select_el.value == 'load' || select_el.value == 'store' || select_el.value == 'beq') { // change to text box
            select_el.parentNode.parentNode.children[3].children[0].remove ();
            let tb = document.createElement ('input'); tb.size = "4";
            select_el.parentNode.parentNode.children[3].appendChild (tb);

        } else { // change to dropdown
            select_el.parentNode.parentNode.children[3].children[0].remove ();
            let src2_select = makeSelect (regs);
            select_el.parentNode.parentNode.children[3].appendChild (src2_select);
        }
        console.log ('changed');
    }

    var tbl = document.getElementById('itbl').getElementsByTagName('tbody')[0];
    let tr = document.createElement ('tr');
    let op = document.createElement ('td'); op.appendChild (op_select);
    let dest = document.createElement ('td'); dest.appendChild (dest_select);
    let src1 = document.createElement ('td'); src1.appendChild (src1_select);
    let src2 = document.createElement ('td'); src2.appendChild (src2_select);

    let del = document.createElement ('td');
    let delbtn = document.createElement ('button');
    delbtn.onclick = function () {
        deleteRow (this);
    }
    delbtn.innerHTML = '-'
    del.appendChild (delbtn);
    tr.appendChild (op);
    tr.appendChild  (dest);
    tr.appendChild  (src1);
    tr.appendChild  (src2);
    tr.appendChild  (del);

    tbl.appendChild (tr);
}
function deleteRow(btn) {
    var row = btn.parentNode.parentNode;
    row.parentNode.removeChild(row);
}
function loadExample1 () {
    let example = [
        ['div', 2, 3, 4],
        ['mul', 1, 5, 6],
        ['add', 3, 7, 8],
        ['mul', 1, 1, 3],
        ['sub', 4, 1, 5],
        ['add', 1, 4, 2],
    ];
    for (let instr of example) {
        addRow ();
        var tbl = document.getElementById('itbl').getElementsByTagName('tbody')[0];
        let row = tbl.rows[tbl.rows.length-1];
        let children = row.children;
        children[0].children[0].value = instr[0];
        children[1].children[0].value = `R${instr[1]}`;
        children[2].children[0].value = `R${instr[2]}`;
        children[3].children[0].value = `R${instr[3]}`;
    }
    let arf = {
        1 : -23,
        2 : 16,
        3 : 25,
        4 : 5,
        5 : 3,
        6 : 4,
        7 : 1,
        8 : 2
    }
    tbl = document.getElementById('rtbl').getElementsByTagName('tbody')[0];
    for (let i in arf) {
        let row = tbl.rows[i];
        row.children[1].children[0].value = arf[i];
    }
}
function loadExample2 () {
    let example = [
        ['add', 0, 0, 0],
        ['beq', 0, 0, 5],
        ['add', 1, 1, 1],
        ['add', 2, 2, 2],
        ['add', 3, 3, 3],
        ['add', 4, 4, 4],
    ];
    for (let instr of example) {
        addRow ();
        var tbl = document.getElementById('itbl').getElementsByTagName('tbody')[0];
        let row = tbl.rows[tbl.rows.length-1];
        let children = row.children;
        children[0].children[0].value = instr[0];
        children[1].children[0].value = `R${instr[1]}`;
        children[2].children[0].value = `R${instr[2]}`;
	console.log (`instr[0] is ${instr[0]}`)
	if (instr[0] != 'beq') {
            children[3].children[0].value = `R${instr[3]}`;
	} else {
	    row.children[3].children[0].remove();
	    let tb_t = document.createElement ('input'); tb_t.size = "4";
	    row.children[3].appendChild (tb_t);
	    console.log (`In beq branch: inst[3]: ${instr[3]}`)
	    children[3].children[0].value = instr[3];
	}
    }
    let arf = {
        1 : -23,
        2 : 16,
        3 : 25,
        4 : 5,
        5 : 3,
        6 : 4,
        7 : 1,
        8 : 2
    }
    tbl = document.getElementById('rtbl').getElementsByTagName('tbody')[0];
    for (let i in arf) {
        let row = tbl.rows[i];
        row.children[1].children[0].value = arf[i];
    }
}
function getInstructions () {
    var tbl = document.getElementById('itbl').getElementsByTagName('tbody')[0];
    let instructions = [];
    for (let i = 0; i < tbl.rows.length; i++) {
        let row = tbl.rows[i];
        let children = row.children;
        let op = children[0].children[0].value;
        let dst = children[1].children[0].value.substr (1);
        let src1 = children[2].children[0].value.substr (1);
        let src2 = children[3].children[0].value.substr (1);
        if (op == 'load' || op == 'store' || op == 'beq') src2 = children[3].children[0].value;
        instructions.push ([op, Number (dst), Number (src1), Number (src2)]);
    }
    return instructions;
}

// Populate register table
for (let i = 0; i < 32; i++) {
    let tbl = document.getElementById('rtbl').getElementsByTagName('tbody')[0];
    let tr = document.createElement ('tr');
    let which = document.createElement ('td');
    which.innerHTML = 'R'+i;
    let input = document.createElement ('td');
    let inputbox = document.createElement ('input');
    inputbox.value = 0;
    input.appendChild (inputbox);
    tr.appendChild (which);
    tr.appendChild (input);
    tbl.appendChild (tr);
}
// Populate Config table
{
    let tbl = document.getElementById ('configtbl').getElementsByTagName ('tbody')[0];
    let defaults = [
        ['add', 2, 2, 1],
        ['sub', 2, 2, 1],
        ['mul', 2, 2, 10],
        ['div', 2, 2, 40],
	['beq', 2, 2, 1],
    ];
    for (let conf of defaults) {
        let tr = document.createElement ('tr');
        let op_td = document.createElement ('td'); op_td.innerHTML = conf[0];

        let nrs_td = document.createElement ('td');
        let input1 = document.createElement ('input'); input1.value = conf[1];
        nrs_td.appendChild (input1);

        let nfu_td = document.createElement ('td');
        let input2 = document.createElement ('input'); input2.value = conf[2];
        nfu_td.appendChild (input2);

        let delay_td = document.createElement ('td');
        let input3 = document.createElement ('input'); input3.value = conf[3];
        delay_td.appendChild (input3);

        tr.appendChild (op_td);
        tr.appendChild (nrs_td);
        tr.appendChild (nfu_td);
        tr.appendChild (delay_td);

        tbl.appendChild (tr);
    }
}
function getRegisterValues () {
    let tbl = document.getElementById('rtbl').getElementsByTagName('tbody')[0];
    let regs = {};
    for (let i = 0; i < tbl.rows.length; i++) {
        let row = tbl.rows[i];
        regs[i] = Number (row.children[1].children[0].value);
    }
    return regs;
}

function getConfig () {
    let tbl = document.getElementById('configtbl').getElementsByTagName('tbody')[0];
    let config = {
        rs_config : {},
        fu_config : {},
    };
    for (let i = 0; i < tbl.rows.length; i++) {
        let row = tbl.rows[i];
        let op = row.children[0].innerHTML;
        let nrs = Number (row.children[1].children[0].value);
        let nfu = Number (row.children[2].children[0].value);
        let del = Number (row.children[3].children[0].value);

        config['fu_config'][op] = {};
        config['rs_config'][op] = {};
        config['fu_config'][op]['count'] = nfu;
        config['fu_config'][op]['delay'] = del;
        config['rs_config'][op]['count'] = nrs;
    }
    config['instr'] = getInstructions ();
    config['reg_config'] = getRegisterValues ();
    return config;
}

function clearTableBodyById (id) {
    let mtbl = document.getElementById (id);
    let tbody = mtbl.getElementsByTagName ('tbody')[0];
    tbody.remove ();
    let tbl = document.createElement ('tbody');
    mtbl.appendChild (tbl);
}
