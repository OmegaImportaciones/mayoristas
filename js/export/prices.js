/* =========================================================
   PRICES — prepara los datos de la lista para PDF y Excel
   (secciones, orden, fecha, comprador). Sin dibujar nada.
========================================================= */

(function () {

    function sectionsFor(products) {

        const config = window.MAYORISTAS_SECCIONES;

        const groups = config.map(s => ({ title: s.titulo, items: [] }));

        const rest = config.findIndex(s => s.resto);

        products.forEach(p => {

            let index = p.sas ? config.findIndex(s => s.sas) : -1;

            if (index < 0) index = config.findIndex(s => s.palabras && s.palabras.includes(p.category));

            if (index < 0) index = rest;

            groups[index].items.push(p);

        });

        groups.forEach(g => g.items.sort((a, b) => a.name.localeCompare(b.name, 'es')));

        return groups.filter(g => g.items.length);

    }


    function pad(n) {

        return String(n).padStart(2, '0');

    }


    function dateText(date) {

        return date ? `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}` : '';

    }


    function fileDate(date) {

        const d = date || new Date();

        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    }


    // products: lista a exportar; scopeLabel: "Toda la lista" o la búsqueda/filtro
    function build(products, scopeLabel) {

        const updated = window.MData.updatedAt();

        const cfg = window.MAYORISTAS;

        return {
            groups: sectionsFor(products),
            total: products.length,
            minimum: window.MData.minimum(),
            updated: dateText(updated),
            generated: dateText(new Date()),
            buyer: window.MOrder.buyer(),
            scope: scopeLabel,
            store: cfg.NOMBRE,
            whatsapp: cfg.WHATSAPP_VISIBLE,
            address: cfg.DIRECCION,
            fileName: `Omega-precios-mayoristas-${fileDate(updated)}`
        };

    }


    function download(blob, name) {

        const link = document.createElement('a');

        link.href = URL.createObjectURL(blob);

        link.download = name;

        document.body.appendChild(link);

        link.click();

        setTimeout(() => { URL.revokeObjectURL(link.href); link.remove(); }, 2000);

    }


    // Carga un script de vendor/ solo la primera vez que se usa
    const loaded = {};

    function loadScript(src) {

        if (!loaded[src]) {
            loaded[src] = new Promise((resolve, reject) => {
                const tag = document.createElement('script');
                tag.src = src;
                tag.onload = resolve;
                tag.onerror = () => { delete loaded[src]; reject(new Error('No se pudo cargar ' + src)); };
                document.head.appendChild(tag);
            });
        }

        return loaded[src];

    }


    // Logo como dataURL (para el PDF)
    let logo = null;

    async function logoData() {

        if (logo) return logo;

        const response = await fetch('./img/omega-icon-180.png');

        const blob = await response.blob();

        logo = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });

        return logo;

    }


    window.MPrices = { build, download, loadScript, logoData };

})();
