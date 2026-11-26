/* =========================================================
   EXCEL — lista de precios mayoristas (.xlsx)
   Hoja "Lista de precios": por secciones, lista para imprimir
     y para armar el pedido (Cantidad -> Subtotal y Total).
   Hoja "Tabla": todo en una tabla con filtros (Categoría,
     Código, Producto, SAS, Precio) para ordenar y buscar.
   Librería: vendor/exceljs (se carga solo al descargar).
========================================================= */

(function () {

    const RED = 'FFE3242B';

    const INK = 'FF18191C';

    const SOFT = 'FF6E7278';

    const LINE = 'FFDEE0E4';

    const BAND = 'FFF6F6F7';

    const MONEY = '"Bs" #,##0.00';

    const thin = { style: 'thin', color: { argb: LINE } };


    function title(ws, data) {

        ws.mergeCells('A1:E1');
        ws.getCell('A1').value = `${data.store.toUpperCase()} · Lista de precios mayoristas`;
        ws.getCell('A1').font = { bold: true, size: 16, color: { argb: INK } };
        ws.getRow(1).height = 26;

        ws.mergeCells('A2:E2');
        ws.getCell('A2').value = `Actualizado: ${data.updated || data.generated}   ·   Precio por mayor desde ${data.minimum} unidades del mismo producto`;
        ws.getCell('A2').font = { bold: true, size: 11, color: { argb: RED } };

        ws.mergeCells('A3:E3');
        ws.getCell('A3').value = `Pedidos por WhatsApp ${data.whatsapp}   ·   ${data.address}`;
        ws.getCell('A3').font = { size: 10, color: { argb: SOFT } };

        let row = 4;

        if (data.buyer) {
            ws.mergeCells(`A${row}:E${row}`);
            ws.getCell(`A${row}`).value = `Preparado para: ${data.buyer}`;
            ws.getCell(`A${row}`).font = { size: 10, color: { argb: INK } };
            row++;
        }

        ws.mergeCells(`A${row}:E${row}`);
        ws.getCell(`A${row}`).value = `Escribe la cantidad en la columna D: el subtotal se calcula solo (mínimo ${data.minimum} por producto).`;
        ws.getCell(`A${row}`).font = { italic: true, size: 9, color: { argb: SOFT } };

        return row + 2;

    }


    function listSheet(wb, data) {

        const ws = wb.addWorksheet('Lista de precios', {
            pageSetup: { paperSize: 1, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.6, header: 0.2, footer: 0.3 } },
            headerFooter: { oddFooter: `&L${data.store} · Precios al ${data.updated || data.generated}&RPágina &P de &N` }
        });

        ws.columns = [
            { key: 'code', width: 19 },
            { key: 'name', width: 58 },
            { key: 'price', width: 14 },
            { key: 'qty', width: 11 },
            { key: 'sub', width: 15 }
        ];

        let r = title(ws, data);

        const headRow = r;

        const head = ws.getRow(r);

        head.values = ['Código', 'Producto', 'Precio c/u', 'Cantidad', 'Subtotal'];

        head.eachCell(c => {
            c.font = { bold: true, color: { argb: INK } };
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEDEEF0' } };
            c.border = { bottom: { style: 'medium', color: { argb: RED } } };
            c.alignment = { vertical: 'middle', horizontal: c.col >= 3 ? 'right' : 'left' };
        });

        head.height = 20;

        r++;

        const firstData = r;

        const min = data.minimum;

        data.groups.forEach(group => {

            ws.mergeCells(`A${r}:E${r}`);
            const cell = ws.getCell(`A${r}`);
            cell.value = `${group.title}  (${group.items.length})`;
            cell.font = { bold: true, size: 12, color: { argb: RED } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BAND } };
            cell.border = { bottom: { style: 'thin', color: { argb: RED } } };
            ws.getRow(r).height = 22;
            r++;

            group.items.forEach(p => {

                const row = ws.getRow(r);

                row.getCell(1).value = p.code;
                row.getCell(1).font = p.sas ? { bold: true, color: { argb: RED } } : { color: { argb: SOFT } };

                row.getCell(2).value = p.name;

                row.getCell(3).value = p.price;
                row.getCell(3).numFmt = MONEY;
                row.getCell(3).font = { bold: true };

                row.getCell(4).alignment = { horizontal: 'center' };
                row.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEA' } };
                row.getCell(4).dataValidation = {
                    type: 'whole', operator: 'greaterThanOrEqual', formulae: [0], allowBlank: true,
                    showErrorMessage: true, errorTitle: 'Cantidad', error: 'Escribe un número entero.'
                };

                // Subtotal solo si llega al mínimo; si no, avisa
                row.getCell(5).value = { formula: `IF(D${r}="","",IF(D${r}<${min},"Mín. ${min}",C${r}*D${r}))` };
                row.getCell(5).numFmt = MONEY;
                row.getCell(5).alignment = { horizontal: 'right' };

                for (let c = 1; c <= 5; c++) row.getCell(c).border = { bottom: thin };

                r++;

            });

        });

        // Total del pedido
        r++;
        ws.getCell(`D${r}`).value = 'Total';
        ws.getCell(`D${r}`).font = { bold: true, size: 12 };
        ws.getCell(`D${r}`).alignment = { horizontal: 'right' };
        ws.getCell(`E${r}`).value = { formula: `SUM(E${firstData}:E${r - 2})` };
        ws.getCell(`E${r}`).numFmt = MONEY;
        ws.getCell(`E${r}`).font = { bold: true, size: 12, color: { argb: RED } };
        ws.getCell(`E${r}`).border = { top: { style: 'medium', color: { argb: RED } } };

        ws.views = [{ state: 'frozen', ySplit: headRow }];

        ws.pageSetup.printTitlesRow = `${headRow}:${headRow}`;

    }


    function tableSheet(wb, data) {

        const ws = wb.addWorksheet('Tabla');

        ws.columns = [
            { header: 'Categoría', key: 'cat', width: 24 },
            { header: 'Código', key: 'code', width: 19 },
            { header: 'Producto', key: 'name', width: 58 },
            { header: 'SAS', key: 'sas', width: 7 },
            { header: 'Precio c/u', key: 'price', width: 14 }
        ];

        data.groups.forEach(g => g.items.forEach(p => {
            ws.addRow({ cat: g.title, code: p.code, name: p.name, sas: p.sas ? 'Sí' : '', price: p.price });
        }));

        ws.getColumn('price').numFmt = MONEY;

        ws.getRow(1).eachCell(c => {
            c.font = { bold: true, color: { argb: INK } };
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEDEEF0' } };
            c.border = { bottom: { style: 'medium', color: { argb: RED } } };
        });

        ws.autoFilter = { from: 'A1', to: `E${ws.rowCount}` };

        ws.views = [{ state: 'frozen', ySplit: 1 }];

    }


    async function create(data) {

        await window.MPrices.loadScript('./vendor/exceljs.min.js');

        const wb = new window.ExcelJS.Workbook();

        wb.creator = data.store;

        wb.created = new Date();

        listSheet(wb, data);

        tableSheet(wb, data);

        const buffer = await wb.xlsx.writeBuffer();

        return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    }


    window.MExportExcel = { create };

})();
