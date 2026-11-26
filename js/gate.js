/* =========================================================
   GATE — pantalla de contraseña
========================================================= */

(function () {

    const ERRORS = {
        'bad-password': 'Contraseña incorrecta. Revísala o escríbenos por WhatsApp.',
        'missing': 'Los precios no están disponibles en este momento. Escríbenos por WhatsApp.',
        'bad-file': 'Los precios no están disponibles en este momento. Escríbenos por WhatsApp.',
        'unsupported': 'Tu navegador no permite este acceso. Ábrelo en Chrome o Safari actualizado.'
    };


    let bound = false;


    function show(onSuccess) {

        const gate = document.getElementById('gate');

        const form = document.getElementById('gateForm');

        const input = document.getElementById('gatePass');

        const error = document.getElementById('gateError');

        const button = document.getElementById('gateSubmit');

        document.getElementById('gateAccess').href =
            M.whatsapp(`Hola ${window.MAYORISTAS.NOMBRE}, quiero comprar por mayor. ¿Cómo puedo acceder a los precios mayoristas?`);

        document.getElementById('gateStore').href = window.MAYORISTAS.TIENDA_URL;

        gate.hidden = false;

        setTimeout(() => input.focus(), 50);

        const setError = text => { error.textContent = text; error.hidden = !text; };

        if (bound) return;

        bound = true;

        input.addEventListener('input', () => setError(''));

        form.addEventListener('submit', async event => {

            event.preventDefault();

            if (!input.value.trim()) { setError('Escribe la contraseña.'); input.focus(); return; }

            button.disabled = true;

            button.textContent = 'Verificando…';

            try {

                await window.MData.unlock(input.value);

                input.value = '';

                gate.hidden = true;

                onSuccess();

            } catch (e) {

                setError(ERRORS[e.message] || ERRORS.missing);

                input.select();

            } finally {

                button.disabled = false;

                button.textContent = 'Entrar';

            }

        });

    }


    window.MGate = { show };

})();
