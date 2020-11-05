const errorMessage = {
    tableCreated: 'Таблица уже создана. Используйте другие кнопки.',
    tableNotCreated: 'Таблица не создана. Нажмите "Создать таблицу".'
};

let getTableContainerElements = function () {
    return document.getElementById('table-container');
};

let getTableElement = function () {
    let elements = document.getElementsByTagName('table');
    return elements.length > 0 ? elements[0] : false;
};

let getErrorElement = function () {
    return document.getElementById('error');
};

let showError = function (text) {
    let error = getErrorElement();
    error.innerHTML = text;
    error.hidden = false;
};

let clearError = function () {
    getErrorElement().hidden = true;
};

let createTable = function () {
    if (getTableElement()) {
        showError(errorMessage.tableCreated);
        return;
    } else clearError();
    let table = document.createElement('table');
    table.setAttribute('width', '100%');
    table.setAttribute('border', '1');
    table.insertRow().insertCell().contentEditable = true;
    document.getElementById('table-container').appendChild(table);
};

let getColumnsCount = function (table) {
    if (table.rows.length === 0)
        return 1;
    return table.rows[0].cells.length;
};

let addRow = function () {
    let table = getTableElement();
    if (!table) {
        showError(errorMessage.tableNotCreated);
        return;
    } else clearError();
    let columns = getColumnsCount(table);
    let row = table.insertRow();
    for (let i = 0; i < columns; i++)
        row.insertCell().contentEditable = true;
};

let addColumn = function () {
    let table = getTableElement();
    if (!table) {
        showError(errorMessage.tableNotCreated);
        return;
    } else clearError();
    let rows = table.rows.length;
    /*if (rows === 0) {
        showError('В таблице нет строк.');
        return;
    } else clearError();*/
    for (let i = 0; i < rows; i++)
        table.rows[i].insertCell().contentEditable = true;
};

let removeTable = function () {
    let table = getTableElement();
    if (!table) {
        showError(errorMessage.tableNotCreated);
        return;
    } else clearError();
    table.remove();
};
