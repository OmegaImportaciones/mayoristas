/* =========================================================
   TOAST — aviso corto en la parte de abajo
========================================================= */

(function () {

    let node = null;

    let timer = null;


    function show(text) {

        if (!node) {
            node = document.createElement('p');
            node.className = 'toast';
            node.setAttribute('role', 'status');
            document.body.appendChild(node);
        }

        node.textContent = text;

        node.classList.add('is-on');

        clearTimeout(timer);

        timer = setTimeout(() => node.classList.remove('is-on'), 2600);

    }


    window.MToast = { show };

})();
