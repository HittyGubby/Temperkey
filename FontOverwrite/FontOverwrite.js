// ==UserScript==
// @name         Custom Font Overwrite
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Overwrite global font
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let css = `
    body {
        font-family: "Huawei Font" !important;
    }`;

    let style = document.createElement('style');

    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }

    document.getElementsByTagName('head')[0].appendChild(style);
})();
