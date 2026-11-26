/* =========================================================
   SEARCH — búsqueda tolerante
   - Sin tildes, mayúsculas ni signos: "audífono" = "AUDIFONO"
   - Sinónimos: "tipo c" = "usb-c" = "type c"
   - Unidades: "3m" = "3 metros" = "3 mts"; "20 w" = "20w"
   - Singular y plural: "cables" = "cable"
   - Varias palabras: deben estar todas (en cualquier orden)
   Para agregar sinónimos, edita SYNONYMS.
========================================================= */

(function () {

    // [forma canónica, ...variantes]. Las variantes pueden tener espacios.
    const SYNONYMS = [
        ['usbc', 'tipo c', 'type c', 'usb c', 'typec', 'tipoc'],
        ['microusb', 'micro usb', 'v8', 'micro-usb'],
        ['lightning', 'lighting', 'iphone', 'lightnin'],
        ['audifono', 'auricular', 'audifonos', 'auriculares', 'headphone', 'earbuds', 'cascos'],
        ['parlante', 'bocina', 'altavoz', 'speaker'],
        ['cargador', 'charger', 'cubo'],
        ['red', 'ethernet', 'lan', 'rj45', 'gigabit'],
        ['raton', 'mouse'],
        ['teclado', 'keyboard'],
        ['camara', 'camera', 'webcam'],
        ['microfono', 'mic'],
        ['adaptador', 'conversor', 'convertidor'],
        ['hub', 'multipuerto'],
        ['jack', 'aux', '3.5mm', '35mm'],
        ['displayport', 'display port', 'dp']
    ];


    function base(text) {

        return String(text || '')
            .normalize('NFD').replace(/[̀-ͯ]/g, '')
            .toLowerCase()
            .replace(/[{}()\[\],;:"'¿?¡!]/g, ' ')
            .replace(/(\d)\s*(?:mts?|metros?|m)\b/g, '$1metro')
            .replace(/(\d)\s*(?:watts?|w)\b/g, '$1w')
            .replace(/[-_/]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

    }


    function singularAll(text) {

        return text.split(' ').filter(Boolean).map(singular).join(' ');

    }


    // Variantes ordenadas de la más larga a la más corta (frases primero).
    // Se pasan a singular igual que el texto ("conversores" = "conversor").
    const RULES = SYNONYMS
        .flatMap(([canon, ...variants]) => [canon, ...variants].map(v => [singularAll(base(v)), canon]))
        .sort((a, b) => b[0].length - a[0].length)
        .map(([variant, canon]) => [new RegExp(`(^|\\s)${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=\\s|$)`, 'g'), `$1${canon}`]);


    function singular(word) {

        if (/\d/.test(word)) return word;

        // adaptadores -> adaptador, conversores -> conversor (pero cables -> cable)
        if (word.length > 5 && /[rndz]es$/.test(word)) return word.slice(0, -2);

        if (word.length > 3 && /s$/.test(word)) return word.slice(0, -1);

        return word;

    }


    // Texto -> palabras canónicas separadas por espacio
    // (primero singular, después sinónimos)
    function normalize(text) {

        let out = ` ${singularAll(base(text))} `;

        RULES.forEach(([re, canon]) => { out = out.replace(re, canon); });

        return out.replace(/\s+/g, ' ').trim();

    }


    function words(query) {

        return normalize(query).split(' ').filter(Boolean);

    }


    // Todas las palabras de la búsqueda deben aparecer (como inicio de palabra o dentro)
    function matches(searchText, queryWords) {

        return queryWords.every(w => searchText.includes(w));

    }


    window.MSearch = { normalize, words, matches };

})();
