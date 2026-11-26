/* =========================================================
   ORDER — pedido guardado en este dispositivo
   Regla: mínimo por producto (3 del mismo). Bajar del mínimo
   quita el producto del pedido.
========================================================= */

(function () {

    const KEY = 'omega-mayoristas-pedido-v1';

    const BUYER_KEY = 'omega-mayoristas-comprador-v1';

    const listeners = new Set();


    function read() {

        try {
            const data = JSON.parse(localStorage.getItem(KEY));
            return Array.isArray(data) ? data : [];
        } catch (error) {
            return [];
        }

    }


    function write(items) {

        try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (error) { /* sin almacenamiento */ }

        listeners.forEach(fn => fn());

    }


    function qtyOf(id) {

        const item = read().find(i => i.id === String(id));

        return item ? item.qty : 0;

    }


    function setQty(product, qty) {

        const min = window.MData.minimum();

        const max = window.MData.maxQty(product);

        const items = read().filter(i => i.id !== product.id);

        if (qty >= min) items.push({ id: product.id, qty: Math.min(qty, max) });

        write(items);

    }


    function add(product) {

        const current = qtyOf(product.id);

        setQty(product, current ? current + 1 : window.MData.minimum());

    }


    function clear() {

        write([]);

    }


    // Une el pedido con la lista de productos (descarta los que ya no están)
    function resolve(products) {

        const byId = new Map(products.map(p => [p.id, p]));

        const lines = [];

        read().forEach(item => {
            const product = byId.get(item.id);
            if (!product) return;
            const qty = Math.max(window.MData.minimum(), Math.min(item.qty, window.MData.maxQty(product)));
            lines.push({ product, qty, subtotal: product.price * qty });
        });

        return { lines, total: lines.reduce((s, l) => s + l.subtotal, 0) };

    }


    function buyer(value) {

        try {
            if (value === undefined) return localStorage.getItem(BUYER_KEY) || '';
            localStorage.setItem(BUYER_KEY, value.trim());
        } catch (error) {
            return '';
        }

        return value;

    }


    function message(lines, total) {

        const name = buyer();

        const rows = lines.map(l =>
            `• ${l.product.name} (cód. ${l.product.code})\n   ${l.qty} x ${M.money(l.product.price)} = ${M.money(l.subtotal)}`
        ).join('\n');

        return M.whatsapp(
`Hola ${window.MAYORISTAS.NOMBRE}, soy mayorista${name ? ` (${name})` : ''} y quiero hacer este pedido:

${rows}

Total: ${M.money(total)}
Pedido mayorista: ${M.orderCode()}

¿Me confirman disponibilidad para coordinar el pago y la entrega?`
        );

    }


    function onChange(fn) {

        listeners.add(fn);

    }


    window.MOrder = { qtyOf, setQty, add, clear, resolve, buyer, message, onChange };

})();
