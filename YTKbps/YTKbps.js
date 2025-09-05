// ==UserScript==
// @name         YouTube Kbps Randomizer
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Randomize specific YouTube element with Kbps values
// @author       ChatGPT
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const XPATH = "/html/body/ytd-app/div[1]/ytd-page-manager/ytd-watch-flexy/div[5]/div[1]/div/div[1]/div[2]/div/div[2]/ytd-player/div/div/div[26]/div/div[9]/span/span[2]";

    function getRandomKbps() {
        return Math.floor(Math.random() * (700000 - 300000 + 1)) + 300000 + " Kbps";
    }

    function updateText() {
        const result = document.evaluate(XPATH, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        const target = result.singleNodeValue;
        if (target) {
            target.textContent = getRandomKbps();
        }
    }

    setInterval(updateText, 500); // Update every 500ms
})();
