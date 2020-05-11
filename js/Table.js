function Table (cols, el) {
    this.cols = cols;
    this.el = el;
    if (el == undefined)  this.el = document.createElement ('table');
}
Table.prototype.addRow = function () {
    if (arguments.length != this.cols) {
        console.error ('#cols != #args');
        console.error (arguments.length, this.cols);
    } else {
        let row = document.createElement ('tr');
        for (let i = 0; i < this.cols; ++i) {
            let col = document.createElement ('td');
            col.innerHTML = arguments[i];
            row.appendChild (col);
        }
        this.el.appendChild (row);
    }
};
Table.prototype.modifyRow = function (id) {
    if (arguments.length-1 > this.cols) {
        console.error ('#cols > #args');
    } else {
        if (this.el.rows[id] == undefined) {
            let args = new Array (this.cols).fill ("");
            console.log (args);
            this.addRow.apply (this, args);
        }
        let cells = this.el.rows[id].cells;
        for (let i = 0; i < arguments.length-1; ++i) {
            cells[i].innerHTML = arguments[i+1];
        }
    }
}
Table.prototype.modifyCell = function (row, col, val) {
    if (this.el.rows[row] == undefined) {
        let args = new Array (this.cols).fill ("");
        this.addRow.apply (this, args);
    }
    this.el.rows[row].cells[col].innerHTML = val;
}
