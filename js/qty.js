/* =========================================================
   QTY — cantidad escribible en lista, pedido y foto ampliada
   - Vacío o 0: quita el producto del pedido.
   - Menos del mínimo: sube al mínimo (3) y avisa.
   - Más del stock/tope: baja al máximo y avisa.
========================================================= */

(function () {

    function apply(input) {

        const product = window.MList.find(input.dataset.qty);

        if (!product) return;

        const min = window.MData.minimum();

        const max = window.MData.maxQty(product);

        const typed = parseInt(String(input.value).replace(/\D/g, ''), 10) || 0;

        let qty = typed;

        let note = '';

        if (typed > 0 && typed < min) { qty = min; note = `El mínimo por producto es ${min}.`; }

        if (typed > max) { qty = max; note = `Máximo disponible: ${max}.`; }

        window.MOrder.setQty(product, qty);

        window.MList.refreshRow(product.id);

        window.MViewer.refresh(product.id);

        if (note) window.MToast.show(note);

    }


    document.addEventListener('change', e => {
        if (e.target.matches('input[data-qty]')) apply(e.target);
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Enter' && e.target.matches('input[data-qty]')) e.target.blur();
    });

    // Al tocar el número se selecciona todo para escribir encima
    document.addEventListener('focusin', e => {
        if (e.target.matches('input[data-qty]')) setTimeout(() => e.target.select(), 0);
    });

})();
