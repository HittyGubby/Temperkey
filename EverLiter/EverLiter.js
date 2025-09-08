// ==UserScript==
// @name         All-in-One Latin Transliterator
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Transliterate non-Latin scripts to Latin using transliteration library. Recursive traversal including open shadow roots.
// @author       Hitty
// @match        *://*/*
// @run-at       document-start
// @grant        none
// @require      https://cdn.jsdelivr.net/npm/transliteration@2.1.8/dist/browser/bundle.umd.min.js
// ==/UserScript==

(function () {
    'use strict';
    const { transliterate } = window;

    function hasNonLatin(text) {
        return /[^\x00-\x7F]/u.test(text);
    }

    function getAllTextNodes(root) {
        const textNodes = [];
        function recurse(currentNode) {
            const walker = document.createTreeWalker(currentNode, NodeFilter.SHOW_TEXT, null, false);
            let node;
            while (node = walker.nextNode()) {
                textNodes.push(node);
            }
            if (currentNode.shadowRoot && currentNode.shadowRoot.mode === 'open') {
                recurse(currentNode.shadowRoot);
            }
            for (let child of currentNode.children || []) {
                recurse(child);
            }
        }
        recurse(root);
        return textNodes;
    }

    function transliterateNodes(root) {
        const textNodes = getAllTextNodes(root);
        textNodes.forEach(node => {
            if (hasNonLatin(node.textContent)) node.textContent = transliterate(node.textContent);
        });
    }

    function onMutation(mutations) {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(added => {
                    if (added.nodeType === Node.TEXT_NODE) {
                        if (hasNonLatin(added.textContent)) added.textContent = transliterate(added.textContent)
                    } else if (added.nodeType === Node.ELEMENT_NODE) {
                        transliterateNodes(added);
                    }
                });
            }
        });
    }

    function init() {
        transliterateNodes(document);
        const observer = new MutationObserver(onMutation);
        observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
