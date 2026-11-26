/* =========================================================
   SECTIONS — cómo se agrupa la lista en el PDF y el Excel
   Cada producto va a la PRIMERA sección cuya lista contenga
   la primera palabra de su nombre. Los SAS van siempre a
   "Productos SAS". Lo que no encaje va a "Otros productos".
   Para mover una categoría, cambia la palabra de lista.
========================================================= */

window.MAYORISTAS_SECCIONES = [

    { titulo: 'Productos SAS', sas: true },

    { titulo: 'Cables y conectividad', palabras: ['CABLE', 'ADAPTADOR', 'ADAPTOR', 'CONVERSOR', 'HUB', 'SPLITTER', 'EXTENSOR', 'CONECTOR', 'ACOPLE', 'CAPTURADOR', 'CONMUTADOR', 'CADDY', 'LECTOR', 'SWITCH'] },

    { titulo: 'Cargadores y energía', palabras: ['CARGADOR', 'POWER', 'ESTABILIZADOR', 'CORTA', 'CORTAPICOS', 'REGLETA', 'UPS', 'INVERSOR', 'FUENTE', 'PILA', 'PILAS', 'BATERIA', 'ENCHUFE', 'TOMA', 'TOMACORRIENTE', 'INTERRUPTOR', 'BARRA'] },

    { titulo: 'Audio', palabras: ['AUDIFONO', 'AUDIFINO', 'AUDIFONI', 'AURICULAR', 'PARLANTE', 'MICROFONO', 'MEGAFONO', 'GRABADOR', 'RECEPTOR', 'TRANSMISOR', 'ALEXA'] },

    { titulo: 'Redes e internet', palabras: ['MODEM', 'ROUTER', 'REPETIDOR', 'MESH'] },

    { titulo: 'Computación', palabras: ['MOUSE', 'TECLADO', 'TACLADO', 'PAD', 'FLASH', 'MSD', 'MEMORIA', 'DISCO', 'CASE', 'COOLER', 'IMPRESORA', 'TINTA', 'NOTEBOOK', 'TARJETA', 'PRESENTADOR'] },

    { titulo: 'Cámaras y seguridad', palabras: ['CAMARA', 'CERRADURA', 'TIMBRE', 'DETECTOR', 'INTERCOMUNICADOR', 'LOCALIZADOR', 'GPS'] },

    { titulo: 'Celulares y smartwatch', palabras: ['SMARTWATCH', 'RELOJ', 'CELULAR', 'SOPORTE', 'TRIPODE', 'ARO', 'PROTECTOR', 'FUNDA', 'CARPLAY', 'LAPIZ', 'TABLETA', 'XIAOMI'] },

    { titulo: 'TV, video y juegos', palabras: ['PROYECTOR', 'TV', 'CONTROL', 'MANDO', 'GAME', 'CHROMECAST'] },

    { titulo: 'Iluminación', palabras: ['FOCO', 'FOCOS', 'LAMPARA', 'LUZ', 'TIRA', 'LINTERNA', 'PANEL'] },

    { titulo: 'Otros productos', resto: true }

];
