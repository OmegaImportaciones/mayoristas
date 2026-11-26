/* =========================================================
   LIST — buscador, filtros, orden y filas de productos
========================================================= */

(function () {

    const CFG = window.MAYORISTAS;

    let all = [];

    let state = { query: '', filter: 'todos', sort: 'nombre', limit: CFG.POR_PAGINA };


    function $(id) { return document.getElementById(id); }


    // ---------- Filtros rápidos ----------

    function buildChips() {

        const counts = {};

        all.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });

        const top = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, CFG.FILTROS)
            .map(([cat]) => cat);

        const chips = [['todos', 'Todos'], ['sas', 'SAS'], ...top.map(c => [c, M.titleCase(c)])];

        $('chips').innerHTML = chips.map(([value, label]) =>
            `<button type="button" class="chip${value === state.filter ? ' is-on' : ''}" data-filter="${M.esc(value)}" role="tab" aria-selected="${value === state.filter}">${M.esc(label)}</button>`
        ).join('');

    }


    // ---------- Filtrar y ordenar ----------

    function visible() {

        const words = M.normalize(state.query).split(/\s+/).filter(Boolean);

        let list = all.filter(p => {
            if (state.filter === 'sas' && !p.sas) return false;
            if (state.filter !== 'todos' && state.filter !== 'sas' && p.category !== state.filter) return false;
            return words.every(w => p.search.includes(w));
        });

        const sorters = {
            'nombre': (a, b) => a.name.localeCompare(b.name, 'es'),
            'precio-asc': (a, b) => a.price - b.price,
            'precio-desc': (a, b) => b.price - a.price
        };

        return list.sort(sorters[state.sort] || sorters.nombre);

    }


    // ---------- Filas ----------

    function control(p) {

        const qty = window.MOrder.qtyOf(p.id);

        const min = window.MData.minimum();

        if (!qty) {
            return `<button type="button" class="add" data-add="${p.id}" aria-label="Agregar ${min} de ${M.esc(p.name)}">+ ${min}</button>`;
        }

        return `
            <div class="stepper" aria-label="Cantidad de ${M.esc(p.name)}">
                <button type="button" data-step="-1" data-id="${p.id}" aria-label="${qty <= min ? 'Quitar' : 'Restar uno'}">${qty <= min ? '✕' : '−'}</button>
                <output>${qty}</output>
                <button type="button" data-step="1" data-id="${p.id}" aria-label="Sumar uno">+</button>
            </div>`;

    }


    function row(p) {

        const save = p.retail > p.price ? Math.round((1 - p.price / p.retail) * 100) : 0;

        return `
            <li class="row" data-id="${p.id}">
                <div class="thumb">${p.image ? `<img src="${M.esc(p.image)}" alt="" loading="lazy" decoding="async" onerror="this.remove()">` : ''}</div>
                <div class="row-info">
                    <p class="row-name">${M.esc(p.name)}</p>
                    <p class="row-meta">${p.sas ? `<span class="sas">SAS${p.model ? ' · ' + M.esc(p.model) : ''}</span>` : ''}<span>Cód. ${M.esc(p.code)}</span></p>
                    <p class="row-price"><strong>${M.money(p.price)}</strong> c/u${save ? `<span class="row-save">−${save}%</span>` : ''}</p>
                </div>
                <div class="row-action">${control(p)}</div>
            </li>`;

    }


    function render() {

        const list = visible();

        const shown = list.slice(0, state.limit);

        $('list').innerHTML = shown.map(row).join('');

        $('count').textContent = `${list.length} producto${list.length === 1 ? '' : 's'}`;

        $('empty').hidden = list.length > 0;

        $('more').hidden = list.length <= state.limit;

        $('more').textContent = `Mostrar más (${list.length - shown.length})`;

    }


    // Actualiza solo el control de un producto (sin redibujar todo)
    function refreshRow(id) {

        const li = $('list').querySelector(`.row[data-id="${CSS.escape(id)}"]`);

        const p = all.find(x => x.id === id);

        if (li && p) li.querySelector('.row-action').innerHTML = control(p);

    }


    function bind() {

        $('search').addEventListener('input', M.debounce(e => {
            state.query = e.target.value;
            state.limit = CFG.POR_PAGINA;
            render();
        }, 150));

        $('sort').addEventListener('change', e => { state.sort = e.target.value; render(); });

        $('chips').addEventListener('click', e => {
            const chip = e.target.closest('[data-filter]');
            if (!chip) return;
            state.filter = chip.dataset.filter;
            state.limit = CFG.POR_PAGINA;
            buildChips();
            render();
        });

        $('more').addEventListener('click', () => { state.limit += CFG.POR_PAGINA; render(); });

        $('list').addEventListener('click', e => {

            const add = e.target.closest('[data-add]');

            const step = e.target.closest('[data-step]');

            if (add) {
                const p = all.find(x => x.id === add.dataset.add);
                window.MOrder.add(p);
                refreshRow(p.id);
            }

            if (step) {
                const p = all.find(x => x.id === step.dataset.id);
                window.MOrder.setQty(p, window.MOrder.qtyOf(p.id) + Number(step.dataset.step));
                refreshRow(p.id);
            }

        });

    }


    function mount(products) {

        all = products;

        buildChips();

        bind();

        render();

    }


    window.MList = { mount, refreshRow };

})();
