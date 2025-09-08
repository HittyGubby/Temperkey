// ==UserScript==
// @name         Bilibili One-Click Favorite
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Adds a floating button and keyboard shortcut (K) to save Bilibili videos to collections, bypassing CORS with GM.xmlHttpRequest
// @author       Hitty
// @match        https://www.bilibili.com/*
// @grant        GM.xmlHttpRequest
// ==/UserScript==

(function () {
    'use strict';

    // Function to get cookie value
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return '';
    }

    // Function to show toast
    function showToast(message, isSuccess) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.position = 'fixed';
        toast.style.top = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.background = isSuccess ? '#4CAF50' : '#FF0000';
        toast.style.fontSize = '64px'
        toast.style.color = 'white';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '5px';
        toast.style.zIndex = '10000';
        toast.style.opacity = '1';
        toast.style.transition = 'opacity 1s';
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 1000);
        }, 2000);
    }

    // Function to save video to collection
    function saveToCollection() {
        const urlParams = new URLSearchParams(window.location.search);
        const oid = urlParams.get('oid');
        if (!oid) {
            showToast('Error: Video ID not found');
            return;
        }

        const csrf = getCookie('bili_jct');
        if (!csrf) {
            showToast('Error: CSRF token not found');
            return;
        }

        GM.xmlHttpRequest({
            method: 'POST',
            url: 'https://api.bilibili.com/x/v3/fav/resource/deal',
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.5',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-site',
                'Priority': 'u=0',
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            },
            data: `rid=${oid}&type=2&add_media_ids=177294230%2C3447244930&del_media_ids=&platform=web&from_spmid=&spmid=333.1245.0.0&statistics=%7B%22appId%22%3A100%2C%22platform%22%3A5%7D&eab_x=1&ramval=14&ga=1&gaia_source=web_normal&csrf=${csrf}`,
            onload: function (response) {
                try {
                    const data = JSON.parse(response.responseText);
                    if (data.code === 0) {
                        showToast('Video saved to collections!', true);
                    } else {
                        showToast('Failed to save video', false);
                    }
                } catch (error) {
                    showToast('Error parsing response', false);
                }
            },
            onerror: function () {
                showToast('Error saving video', false);
            }
        });
    }

    // Create floating button
    const button = document.createElement('button');
    button.textContent = 'Save';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.background = '#00A1D6';
    button.style.color = 'white';
    button.style.padding = '10px 20px';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.zIndex = '10000';
    button.addEventListener('click', saveToCollection);
    document.body.appendChild(button);

    // Add keyboard shortcut
    document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'l') {
            saveToCollection();
        }
    });
})();
