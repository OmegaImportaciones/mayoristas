/* =========================================================
   APP — arranque: contraseña o lista
========================================================= */

(function () {

    function $(id) { return document.getElementById(id); }


    async function start() {

        $('loading').hidden = false;

        try {

            const products = await window.MData.products();

            const updated = window.MData.updatedAt();

            $('info').innerHTML = `Precio por mayor desde <strong>${window.MData.minimum()} unidades del mismo producto</strong>`
                + (updated ? ` · actualizado ${updated.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit' })}` : '');

            window.MList.mount(products);

            window.MSheet.mount(products);

            $('app').hidden = false;

        } catch (error) {

            console.error(error);

            window.MData.lock();

            window.MGate.show(start);

        } finally {

            $('loading').hidden = true;

        }

    }


    $('logout').addEventListener('click', () => {
        window.MData.lock();
        location.reload();
    });


    if (window.MData.isActive()) {
        start();
    } else {
        $('loading').hidden = true;
        window.MGate.show(start);
    }

})();
