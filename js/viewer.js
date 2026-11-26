/* =========================================================
   VIEWER — foto ampliada del producto
   - Toca la miniatura para abrir.
   - Varias fotos: deslizar, flechas o puntos.
   - Toca la foto para acercar (x2) y vuelve a tocar para alejar.
   - Desde aquí también se puede agregar al pedido.
========================================================= */

(function () {

    let product = null;

    let index = 0;

    let lastFocus = null;

    let touchX = null;


    function $(id) { return document.getElementById(id); }


    function isOpen() {

        return $('viewer').classList.contains('is-open');

    }


    function renderImage() {

        const img = $('viewerImg');

        img.classList.remove('is-zoomed');

        img.style.transformOrigin = '';

        img.src = product.images[index];

        img.alt = `${product.name}, foto ${index + 1} de ${product.images.length}`;

        const many = product.images.length > 1;

        $('viewerPrev').hidden = !many;

        $('viewerNext').hidden = !many;

        $('viewerDots').innerHTML = many
            ? product.images.map((_, i) => `<button type="button" class="viewer-dot${i === index ? ' is-on' : ''}" data-dot="${i}" aria-label="Foto ${i + 1}"></button>`).join('')
            : '';

    }


    function renderInfo() {

        $('viewerName').textContent = product.name;

        $('viewerMeta').textContent = `${product.sas ? `SAS${product.model ? ' · ' + product.model : ''} · ` : ''}Cód. ${product.code}`;

        $('viewerPrice').innerHTML = `<strong>${M.money(product.price)}</strong> c/u`;

        $('viewerAction').innerHTML = window.MList.control(product);

    }


    function go(step) {

        const total = product.images.length;

        index = (index + step + total) % total;

        renderImage();

    }


    function open(p) {

        if (!p || !p.images.length) return;

        product = p;

        index = 0;

        lastFocus = document.activeElement;

        renderImage();

        renderInfo();

        $('viewer').classList.add('is-open');

        $('viewer').setAttribute('aria-hidden', 'false');

        document.documentElement.classList.add('no-scroll');

        $('viewerClose').focus();

    }


    function close() {

        $('viewer').classList.remove('is-open');

        $('viewer').setAttribute('aria-hidden', 'true');

        document.documentElement.classList.remove('no-scroll');

        if (lastFocus) lastFocus.focus();

    }


    // Acercar en el punto tocado
    function toggleZoom(event) {

        const img = $('viewerImg');

        if (img.classList.contains('is-zoomed')) {
            img.classList.remove('is-zoomed');
            return;
        }

        const r = img.getBoundingClientRect();

        img.style.transformOrigin = `${((event.clientX - r.left) / r.width) * 100}% ${((event.clientY - r.top) / r.height) * 100}%`;

        img.classList.add('is-zoomed');

    }


    function bind() {

        const viewer = $('viewer');

        viewer.addEventListener('click', e => {

            // Tocar el fondo oscuro (fuera de la foto) también cierra
            if (e.target.closest('[data-vclose]') || e.target.id === 'viewerStage') return close();

            const dot = e.target.closest('[data-dot]');

            if (dot) { index = Number(dot.dataset.dot); renderImage(); return; }

            const add = e.target.closest('[data-add]');

            const step = e.target.closest('[data-step]');

            if (add) window.MOrder.add(product);

            if (step) window.MOrder.setQty(product, window.MOrder.qtyOf(product.id) + Number(step.dataset.step));

            if (add || step) {
                $('viewerAction').innerHTML = window.MList.control(product);
                window.MList.refreshRow(product.id);
            }

        });

        $('viewerPrev').addEventListener('click', () => go(-1));

        $('viewerNext').addEventListener('click', () => go(1));

        $('viewerImg').addEventListener('click', toggleZoom);

        $('viewerImg').addEventListener('error', () => { $('viewerImg').alt = 'No se pudo cargar la foto'; });

        // Deslizar para cambiar de foto
        const stage = $('viewerStage');

        stage.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });

        stage.addEventListener('touchend', e => {
            if (touchX === null || $('viewerImg').classList.contains('is-zoomed')) return;
            const dx = e.changedTouches[0].clientX - touchX;
            touchX = null;
            if (Math.abs(dx) > 50 && product.images.length > 1) go(dx < 0 ? 1 : -1);
        });

        document.addEventListener('keydown', e => {
            if (!isOpen()) return;
            if (e.key === 'Escape') close();
            if (e.key === 'ArrowRight' && product.images.length > 1) go(1);
            if (e.key === 'ArrowLeft' && product.images.length > 1) go(-1);
        });

    }


    bind();

        // Si el producto abierto cambió de cantidad desde otro lado
    function refresh(id) {

        if (isOpen() && product && product.id === String(id)) $('viewerAction').innerHTML = window.MList.control(product);

    }


    window.MViewer = { open, close, refresh };

})();
