// ==UserScript==
// @name         Wikipedia Client Preferences Cookie Manager
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Manages client preferences cookie for Wikipedia, Wiktionary, and Wikimedia, removes others, and reloads on light background
// @author       hitty
// @match        *://*.wikipedia.org/*
// @match        *://*.wiktionary.org/*
// @match        *://*.wikimedia.org/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const cookieConfigs = [
        {
            hostname: '.wikipedia.org',
            getCookieName: () => `${window.location.hostname.split('.')[0]}wikimwclientpreferences`,
            desiredValue: 'vector-feature-limited-width-clientpref-0%2Cskin-theme-clientpref-night%2Cvector-feature-custom-font-size-clientpref-0'
        },
        {
            hostname: '.wiktionary.org',
            getCookieName: () => `${window.location.hostname.split('.')[0]}wiktionarymwclientpreferences`,
            desiredValue: 'vector-feature-custom-font-size-clientpref-0%2Cvector-feature-limited-width-clientpref-0%2Cskin-theme-clientpref-night'
        },
        {
            hostname: '.wikimedia.org',
            getCookieName: () => 'commonswikimwclientpreferences',
            desiredValue: 'vector-feature-custom-font-size-clientpref-0%2Cvector-feature-limited-width-clientpref-0%2Cskin-theme-clientpref-night'
        }
    ];

    const currentHostname = window.location.hostname;

    const config = cookieConfigs.find(c => currentHostname.includes(c.hostname.split('.')[1]));
    if (!config) return;

    const cookieName = config.getCookieName();
    const desiredValue = config.desiredValue;

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    function setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;domain=${config.hostname}`;
    }

    function deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${config.hostname}`;
    }

    function clearOtherCookies() {
        const cookies = document.cookie.split(';');
        const cookiePrefixes = ['wikimwclientpreferences', 'wiktionarymwclientpreferences', 'commonswikimwclientpreferences'];
        cookies.forEach(cookie => {
            const name = cookie.split('=')[0].trim();
            if (cookiePrefixes.some(prefix => name.includes(prefix)) && name !== cookieName) {
                deleteCookie(name);
            }
        });
    }

    function checkBackgroundColor() {
        const root = document.documentElement;
        const style = getComputedStyle(root);
        const bgColor = style.getPropertyValue('--background-color-base').trim();
        return bgColor === '#fff';
    }

    // Prevent infinite reload by tracking reload state
    const reloadKey = 'cookieManagerReloaded';
    const hasReloaded = sessionStorage.getItem(reloadKey);

    if (checkBackgroundColor() && !hasReloaded) {
        setCookie(cookieName, desiredValue, 365);
        clearOtherCookies();
        sessionStorage.setItem(reloadKey, 'true');
        window.location.reload();
    } else {
        if (getCookie(cookieName) !== desiredValue) {
            setCookie(cookieName, desiredValue, 365);
            clearOtherCookies();
        }
        sessionStorage.removeItem(reloadKey);
    }
})();