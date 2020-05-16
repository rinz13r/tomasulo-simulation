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
    let op_select = makeSelect (['add', 'sub', 'div', 'mul', 'beq']);
    let regs = []; for (let i = 0; i < 32; i++) regs.push ('R'+i);
    let dest_select = makeSelect (regs);
    let src1_select = makeSelect (regs);
    let src2_select = makeSelect (regs);

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
function getInstructions () {
    var tbl = document.getElementById('itbl').getElementsByTagName('tbody')[0];
    let instructions = [];
    for (let i = 0; i < tbl.rows.length; i++) {
        let row = tbl.rows[i];
        let children = row.children;
        let op = children[0].children[0].value;
        let dst = children[1].children[0].value;
        let src1 = children[2].children[0].value;
        let src2 = children[3].children[0].value;
        instructions.push ([op, dst.substr (1), src1.substr (1), src2.substr (1)]);
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
    let regs = [];
    for (let i = 0; i < tbl.rows.length; i++) {
        let row = tbl.rows[i];
        regs.push (Number (row.children[1].children[0].value));
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
    return config;
}
