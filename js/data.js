/* =========================================================
   DATA — productos públicos + precios mayoristas cifrados
   - unlock(contraseña): descifra mayoristas.enc y guarda el
     resultado en sessionStorage (dura mientras la pestaña
     esté abierta).
   - products(): lista lista para mostrar (solo productos con
     precio por mayor y stock).
========================================================= */

(function () {

    const CFG = window.MAYORISTAS;

    const KEY = 'omega-mayoristas-sesion-v1';

    let session = restore();

    let cache = null;


    function restore() {

        try {
            const data = JSON.parse(sessionStorage.getItem(KEY));
            return data && data.items ? data : null;
        } catch (error) {
            return null;
        }

    }


    async function fetchJSON(name) {

        const response = await fetch(CFG.DATOS + name, { cache: 'no-cache' });

        if (!response.ok) throw new Error('missing');

        return response.json();

    }


    function isActive() {

        return !!session;

    }


    async function unlock(password) {

        if (!window.OmegaVault || !window.OmegaVault.supported()) throw new Error('unsupported');

        let box;

        try { box = await fetchJSON('mayoristas.enc'); }
        catch (error) { throw new Error('missing'); }

        const data = await window.OmegaVault.open(box, password);

        session = { minimo: Math.max(2, Number(data.minimo) || 3), items: data.items || {}, creado: data.creado };

        try { sessionStorage.setItem(KEY, JSON.stringify(session)); } catch (error) { /* modo privado */ }

        cache = null;

        return Object.keys(session.items).length;

    }


    function lock() {

        session = null;

        cache = null;

        try { sessionStorage.removeItem(KEY); } catch (error) { /* nada */ }

    }


    function images(p) {

        return ['imagen', 'imagen2', 'imagen3']
            .map(f => p[f])
            .filter(src => src && !/\/default\.(png|jpe?g|webp)$/i.test(src));

    }


    async function products() {

        if (!session) return [];

        if (cache) return cache;

        const raw = await fetchJSON('products.json');

        cache = (Array.isArray(raw) ? raw : [])
            .filter(p => session.items[String(p.id)] && Number(p.cantidad_disponible) >= 1)
            .map(p => {
                const item = session.items[String(p.id)];
                const sas = M.isSas(p);
                const parts = sas ? M.splitSas(p) : null;
                const name = M.titleCase(parts ? parts.base : String(p.producto || '').replace(/\{SAS\}/ig, ''));
                return {
                    id: String(p.id),
                    name,
                    code: String(p.codigo || ''),
                    model: parts ? parts.model : '',
                    sas,
                    category: M.categoryOf(p),
                    image: images(p)[0] || '',
                    retail: Number(p.precio1) || 0,
                    price: item.p,
                    stock: Number(item.s) || 0,
                    search: M.normalize(`${name} ${p.codigo} ${parts ? parts.model : ''} ${sas ? 'sas' : ''}`)
                };
            });

        return cache;

    }


    function minimum() {

        return session ? session.minimo : 3;

    }


    function updatedAt() {

        return session && session.creado ? new Date(session.creado) : null;

    }


    function maxQty(product) {

        return Math.max(minimum(), Math.min(product.stock || CFG.MAX_POR_PRODUCTO, CFG.MAX_POR_PRODUCTO));

    }


    window.MData = { isActive, unlock, lock, products, minimum, updatedAt, maxQty };

})();
