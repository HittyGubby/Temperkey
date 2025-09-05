// ==UserScript==
// @name         Bilibili Comment Notice Remover
// @namespace    http://tampermonkey.net/
// @version      127.0.0.1
// @description  if not the header parameters this one can challenge the world's shortest js tampermonkey script i guess lmao
// @author       whoever
// @match        *://www.bilibili.com/*
// @grant        none
// ==/UserScript==
(function () { const k = (new MutationObserver(() => { document.getElementById('commentapp').querySelector('bili-comments').shadowRoot.querySelector('#header').querySelector('bili-comments-header-renderer').shadowRoot.querySelector('#notice').remove() })).observe(document.body, { childList: true, subtree: true }) })()