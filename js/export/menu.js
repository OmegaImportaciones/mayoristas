/* =========================================================
   MENU — ventana "Descargar lista de precios"
   Elige alcance (todo / lo que estoy viendo) y formato.
========================================================= */

(function () {

    function $(id) { return document.getElementById(id); }

    let lastFocus = null;

    let busy = false;


    function open() {

        const { all, visible, label } = window.MList.current();

        const filtered = label && visible.length !== all.length;

        $('exportAllCount').textContent = all.length;

        $('exportViewRow').hidden = !filtered;

        $('exportViewLabel').textContent = filtered ? `Solo lo que estoy viendo: ${label} (${visible.length})` : '';

        document.querySelector('input[name="exportScope"][value="all"]').checked = true;

        $('exportBuyer').value = window.MOrder.buyer();

        status('');

        lastFocus = document.activeElement;

        $('export').classList.add('is-open');

        $('export').setAttribute('aria-hidden', 'false');

        document.documentElement.classList.add('no-scroll');

        $('exportClose').focus();

    }


    function close() {

        if (busy) return;

        $('export').classList.remove('is-open');

        $('export').setAttribute('aria-hidden', 'true');

        document.documentElement.classList.remove('no-scroll');

        if (lastFocus) lastFocus.focus();

    }


    function status(text, isError) {

        $('exportStatus').textContent = text;

        $('exportStatus').classList.toggle('is-error', !!isError);

    }


    async function run(format) {

        if (busy) return;

        busy = true;

        document.querySelectorAll('[data-export]').forEach(b => { b.disabled = true; });

        status(format === 'pdf' ? 'Preparando el PDF…' : 'Preparando el Excel…');

        try {

            window.MOrder.buyer($('exportBuyer').value);

            const scope = document.querySelector('input[name="exportScope"]:checked').value;

            const { all, visible, label } = window.MList.current();

            const products = scope === 'view' ? visible : all;

            const data = window.MPrices.build(products, scope === 'view' ? `Selección ${label}` : 'Lista completa');

            const blob = format === 'pdf'
                ? await window.MExportPDF.create(data)
                : await window.MExportExcel.create(data);

            window.MPrices.download(blob, `${data.fileName}.${format === 'pdf' ? 'pdf' : 'xlsx'}`);

            status('Listo. Revisa tus descargas.');

        } catch (error) {

            console.error(error);

            status('No se pudo crear el archivo. Revisa tu conexión e inténtalo de nuevo.', true);

        } finally {

            busy = false;

            document.querySelectorAll('[data-export]').forEach(b => { b.disabled = false; });

        }

    }


    function bind() {

        $('exportOpen').addEventListener('click', open);

        $('export').addEventListener('click', e => {
            if (e.target.closest('[data-xclose]')) close();
            const button = e.target.closest('[data-export]');
            if (button) run(button.dataset.export);
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && $('export').classList.contains('is-open')) close();
        });

    }


    bind();

    window.MExport = { open, close };

})();
