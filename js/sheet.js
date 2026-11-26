/* =========================================================
   SHEET — barra "Ver pedido" y panel del pedido
========================================================= */

(function () {

    let products = [];

    let lastFocus = null;


    function $(id) { return document.getElementById(id); }


    function line(l) {

        const min = window.MData.minimum();

        return `
            <li class="sheet-line">
                <div>
                    <p class="row-name">${M.esc(l.product.name)}</p>
                    <p class="row-meta"><span>Cód. ${M.esc(l.product.code)}</span><span>${M.money(l.product.price)} c/u</span></p>
                </div>
                <div class="stepper">
                    <button type="button" data-step="-1" data-id="${l.product.id}" aria-label="${l.qty <= min ? 'Quitar' : 'Restar uno'}">${l.qty <= min ? '✕' : '−'}</button>
                    ${window.MList.qtyInput(l.product, l.qty)}
                    <button type="button" data-step="1" data-id="${l.product.id}" aria-label="Sumar uno">+</button>
                </div>
                <strong class="sheet-sub">${M.money(l.subtotal)}</strong>
            </li>`;

    }


    function render() {

        const { lines, total } = window.MOrder.resolve(products);

        const units = lines.length;

        $('orderBar').hidden = units === 0;

        $('orderBarCount').textContent = units;

        $('orderBarTotal').textContent = M.money(total);

        $('sheetLines').innerHTML = lines.length
            ? lines.map(line).join('')
            : '<li class="empty">Tu pedido está vacío.</li>';

        $('sheetTotal').textContent = M.money(total);

        $('send').href = window.MOrder.message(lines, total);

        $('send').classList.toggle('is-disabled', !lines.length);

        if (!lines.length && isOpen()) close();

    }


    function isOpen() {

        return $('sheet').classList.contains('is-open');

    }


    function open() {

        lastFocus = document.activeElement;

        $('sheet').classList.add('is-open');

        $('sheet').setAttribute('aria-hidden', 'false');

        document.documentElement.classList.add('no-scroll');

        $('sheet').querySelector('.icon-button').focus();

    }


    function close() {

        $('sheet').classList.remove('is-open');

        $('sheet').setAttribute('aria-hidden', 'true');

        document.documentElement.classList.remove('no-scroll');

        if (lastFocus) lastFocus.focus();

    }


    function mount(list) {

        products = list;

        $('buyer').value = window.MOrder.buyer();

        $('buyer').addEventListener('input', e => { window.MOrder.buyer(e.target.value); render(); });

        $('orderBar').addEventListener('click', open);

        $('sheet').addEventListener('click', e => { if (e.target.closest('[data-close]')) close(); });

        document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen()) close(); });

        $('sheetLines').addEventListener('click', e => {
            const step = e.target.closest('[data-step]');
            if (!step) return;
            const p = products.find(x => x.id === step.dataset.id);
            window.MOrder.setQty(p, window.MOrder.qtyOf(p.id) + Number(step.dataset.step));
            window.MList.refreshRow(p.id);
        });

        $('clear').addEventListener('click', () => {
            const ids = window.MOrder.resolve(products).lines.map(l => l.product.id);
            window.MOrder.clear();
            ids.forEach(id => window.MList.refreshRow(id));
        });

        window.MOrder.onChange(render);

        render();

    }


    window.MSheet = { mount, open, close };

})();
