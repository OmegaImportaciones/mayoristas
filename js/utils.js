/* =========================================================
   UTILS — formato y nombres (misma lógica que el sitio principal)
========================================================= */

(function () {

    function money(value) {

        const number = Number(value) || 0;

        const hasCents = Math.round(number * 100) % 100 !== 0;

        return 'Bs ' + number.toLocaleString('es-BO', {
            minimumFractionDigits: hasCents ? 2 : 0,
            maximumFractionDigits: 2
        });

    }


    function esc(text) {

        return String(text == null ? '' : text).replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));

    }


    function normalize(text) {

        return String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

    }


    const ACRONYMS = new Set(['HDMI', 'USB', 'UTP', 'VGA', 'DVI', 'RCA', 'AV', 'AV2', 'DP', 'UHD', 'FHD', 'HD',
        'PC', 'CPU', 'SSD', 'HDD', 'TV', 'LED', 'RGB', 'SC', 'IP', 'TWS', 'BT', 'OTG', 'KVM', 'HDTV', 'POE', 'RJ45',
        'SD', 'MSD', 'NVME', 'SATA', 'PD', 'QC', 'GB', 'TB', 'MB', '2RCA', '4K', '2K', '8K', 'TP-LINK']);

    const LOWER = new Set(['de', 'a', 'para', 'con', 'y', 'o', 'por', 'en', 'del', 'el', 'la', 'sin', 'mm', 'cm', 'w', 'mah', 'metros', 'metro', 'm']);


    function titleCase(text) {

        return String(text || '').toLowerCase().replace(/\s+/g, ' ').trim().split(' ')
            .map((word, i) => word.split('/').map((part, j) => {
                const up = part.toUpperCase();
                if (ACRONYMS.has(up)) return up;
                if ((i > 0 || j > 0) && LOWER.has(part)) return part;
                return part.replace(/(^|[\-(])([a-záéíóúñ])/g, (m, sep, ch) => sep + ch.toUpperCase());
            }).join('/'))
            .join(' ');

    }


    // SAS: "CABLE HDMI ... SAS S2K3" -> { base, model }
    function isSas(p) {

        return /\{SAS\}/i.test(p.producto || '') || /\bSAS\b/i.test(p.producto || '') || /^SAS\s/i.test(p.codigo || '');

    }


    function splitSas(p) {

        let base = String(p.producto || '').replace(/\{SAS\}/ig, ' ');

        let model = '';

        const tail = base.match(/\s+SAS\s+(\S+)\s*$/i);

        if (tail) { model = tail[1]; base = base.slice(0, tail.index); }
        else {
            base = base.replace(/\bSAS\b/ig, ' ');
            const code = String(p.codigo || '').match(/^SAS\s+(.+)$/i);
            if (code) model = code[1].trim();
        }

        return { base: base.replace(/\s+/g, ' ').trim(), model: model.toUpperCase() };

    }


    function categoryOf(p) {

        const name = String(p.producto || '').replace(/\{SAS\}/ig, ' ').trim().toUpperCase();

        return name ? name.split(/\s+/)[0] : 'OTROS';

    }


    function debounce(fn, ms) {

        let t;

        return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };

    }


    function whatsapp(message) {

        return `https://wa.me/${window.MAYORISTAS.WHATSAPP}?text=${encodeURIComponent(message)}`;

    }


    function orderCode() {

        const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

        let code = '';

        for (let i = 0; i < 4; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];

        return 'MY-' + code;

    }


    window.M = { money, esc, normalize, titleCase, isSas, splitSas, categoryOf, debounce, whatsapp, orderCode };

})();
