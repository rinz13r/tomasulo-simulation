function Table (cols) {
    this.cols = cols;
    this.el = document.createElement ('table');
}
Table.prototype.addRow = function () {
    if (arguments.length != this.cols) {
        console.error ('#cols != #args');
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
    if (arguments.length-1 != this.cols) {
        console.error ('#cols != #args');
    } else {
        let cells = this.el.rows[id].cells;
        for (let i = 0; i < this.cols; ++i) {
            cells[i].innerHTML = arguments[i+1];
        }
    }
}
