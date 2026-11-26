/* =========================================================
   PDF — lista de precios mayoristas (tamaño carta)
   Colores suaves para imprimir: fondo blanco, grises claros
   y el rojo Omega solo como acento.
   Librerías: vendor/jspdf + vendor/jspdf-autotable
   (se cargan solo cuando se descarga el PDF).
========================================================= */

(function () {

    const RED = [227, 36, 43];

    const INK = [24, 25, 28];

    const SOFT = [110, 114, 120];

    const LINE = [222, 224, 228];

    const BAND = [246, 246, 247];

    const MARGIN = 14;


    function money(value) {

        const n = Number(value) || 0;

        const cents = Math.round(n * 100) % 100 !== 0;

        return 'Bs ' + n.toLocaleString('es-BO', { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: 2 });

    }


    // Portada compacta: logo, título, fecha y condiciones
    function cover(doc, data, logo) {

        const width = doc.internal.pageSize.getWidth();

        doc.addImage(logo, 'PNG', MARGIN, 14, 18, 18);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...SOFT);
        doc.text(data.store.toUpperCase(), MARGIN + 23, 19, { charSpace: 0.6 });

        doc.setFontSize(19);
        doc.setTextColor(...INK);
        doc.text('Lista de precios mayoristas', MARGIN + 23, 28);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...SOFT);
        doc.text('Actualizado', width - MARGIN, 19, { align: 'right' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(...RED);
        doc.text(data.updated || data.generated, width - MARGIN, 26, { align: 'right' });

        // Franja de condiciones
        doc.setFillColor(...BAND);
        doc.setDrawColor(...LINE);
        doc.roundedRect(MARGIN, 38, width - MARGIN * 2, data.buyer ? 22 : 17, 2, 2, 'FD');

        doc.setFontSize(10);
        doc.setTextColor(...INK);
        doc.text(`Precio por mayor desde ${data.minimum} unidades del mismo producto.`, MARGIN + 5, 45);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...SOFT);
        doc.text(`Pedidos por WhatsApp ${data.whatsapp}  ·  ${data.address}`, MARGIN + 5, 51);

        if (data.buyer) {
            doc.setTextColor(...INK);
            doc.text(`Preparado para: ${data.buyer}`, MARGIN + 5, 56.5);
        }

        let y = data.buyer ? 68 : 63;

        // Resumen de secciones
        doc.setFontSize(8.5);
        doc.setTextColor(...SOFT);

        const summary = data.groups.map(g => `${g.title} (${g.items.length})`).join('   ·   ');

        const lines = doc.splitTextToSize(`${data.scope}: ${data.total} productos   ·   ${summary}`, width - MARGIN * 2);

        doc.text(lines, MARGIN, y);

        return y + lines.length * 4 + 3;

    }


    // Cuerpo: una sola tabla con una fila-título por sección
    function body(data) {

        const rows = [];

        data.groups.forEach(group => {

            rows.push([{
                content: `${group.title}  (${group.items.length})`,
                colSpan: 4,
                styles: { fillColor: [255, 255, 255], textColor: RED, fontStyle: 'bold', fontSize: 11, cellPadding: { top: 5, bottom: 2, left: 1 }, lineWidth: 0 },
                section: true
            }]);

            group.items.forEach(p => {
                rows.push([
                    { content: p.code, styles: p.sas ? { textColor: RED, fontStyle: 'bold' } : {} },
                    p.name,
                    { content: money(p.price), styles: { halign: 'right', fontStyle: 'bold' } },
                    ''
                ]);
            });

        });

        return rows;

    }


    function footer(doc, data, totalPagesTag) {

        const width = doc.internal.pageSize.getWidth();

        const height = doc.internal.pageSize.getHeight();

        doc.setDrawColor(...LINE);
        doc.line(MARGIN, height - 12, width - MARGIN, height - 12);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...SOFT);

        const left = `${data.store} · Precios mayoristas al ${data.updated || data.generated} · Sujetos a disponibilidad`
            + (data.buyer ? ` · Preparado para ${data.buyer}` : '');

        doc.text(left, MARGIN, height - 7);

        doc.text(`Página ${doc.internal.getNumberOfPages()} de ${totalPagesTag}`, width - MARGIN, height - 7, { align: 'right' });

    }


    async function create(data) {

        await window.MPrices.loadScript('./vendor/jspdf.umd.min.js');

        await window.MPrices.loadScript('./vendor/jspdf.plugin.autotable.min.js');

        const logo = await window.MPrices.logoData();

        const { jsPDF } = window.jspdf;

        const doc = new jsPDF({ unit: 'mm', format: 'letter', compress: true });

        doc.setProperties({ title: `Lista de precios mayoristas ${data.updated}`, author: data.store, creator: data.store });

        const startY = cover(doc, data, logo);

        const TOTAL = '{total_pages}';

        doc.autoTable({
            startY,
            margin: { left: MARGIN, right: MARGIN, top: 16, bottom: 18 },
            head: [['Código', 'Producto', 'Precio c/u', 'Cant.']],
            body: body(data),
            showHead: 'everyPage',
            theme: 'plain',
            styles: { font: 'helvetica', fontSize: 9, textColor: INK, cellPadding: { top: 1.7, bottom: 1.7, left: 2, right: 2 }, lineColor: LINE, lineWidth: { bottom: 0.2 }, valign: 'middle' },
            // Encabezado claro (para imprimir sin gastar tinta)
            headStyles: { fillColor: BAND, textColor: INK, fontStyle: 'bold', fontSize: 8.5, lineColor: RED, lineWidth: { bottom: 0.5 } },
            columnStyles: {
                0: { cellWidth: 34, textColor: SOFT },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 27, halign: 'right' },
                3: { cellWidth: 16 }
            },
            didParseCell: hook => {
                if (hook.section === 'head' && (hook.column.index === 2)) hook.cell.styles.halign = 'right';
            },
            didDrawCell: hook => {
                // Casilla para anotar la cantidad a mano
                if (hook.section === 'body' && hook.column.index === 3 && !hook.row.raw[0].section) {
                    const c = hook.cell;
                    hook.doc.setDrawColor(...LINE);
                    hook.doc.roundedRect(c.x + 2.5, c.y + 1.4, c.width - 5, c.height - 2.8, 1, 1, 'S');
                }
            },
            didDrawPage: () => {
                // Encabezado corto en las páginas siguientes
                if (doc.internal.getNumberOfPages() > 1) {
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(8);
                    doc.setTextColor(...SOFT);
                    doc.text(`${data.store.toUpperCase()} · LISTA DE PRECIOS MAYORISTAS`, MARGIN, 10);
                    doc.setTextColor(...RED);
                    doc.text(data.updated || data.generated, doc.internal.pageSize.getWidth() - MARGIN, 10, { align: 'right' });
                }
                footer(doc, data, TOTAL);
            }
        });

        doc.putTotalPages(TOTAL);

        return doc.output('blob');

    }


    window.MExportPDF = { create };

})();
