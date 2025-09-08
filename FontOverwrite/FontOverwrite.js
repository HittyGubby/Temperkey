// ==UserScript==
// @name         Force Font
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Overrides all fonts to Electrolize from Google Fonts
// @author       Hitty
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Electrolize&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.textContent = `
    * {
        font-family: 'Electrolize', sans-serif !important;
    }
    `;
    document.head.appendChild(style);

    const observer = new MutationObserver(() => {
        document.querySelectorAll('*').forEach(el => {
            el.style.fontFamily = "'Electrolize' !important";
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
