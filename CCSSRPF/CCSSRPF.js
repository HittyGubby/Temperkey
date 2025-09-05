// ==UserScript==
// @name         Bypass CSRF/CSP with GM_xmlhttpRequest
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Replace window.fetch & XMLHttpRequest with GM_xmlhttpRequest-backed versions
// @author       zjs
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // --- fetch wrapper using GM_xmlhttpRequest ---
    window.fetch = function (input, init = {}) {
        return new Promise((resolve, reject) => {
            try {
                let url = (typeof input === "string") ? input : input.url;
                let method = init.method || (typeof input === "object" && input.method) || "GET";
                let headers = init.headers || (typeof input === "object" && input.headers) || {};
                let body = init.body || null;

                GM_xmlhttpRequest({
                    url,
                    method,
                    headers,
                    data: body,
                    responseType: "arraybuffer", // raw data, we wrap below
                    onload: res => {
                        let blob = new Blob([res.response]);
                        let response = new Response(blob, {
                            status: res.status,
                            statusText: res.statusText,
                            headers: res.responseHeaders
                        });
                        resolve(response);
                    },
                    onerror: err => reject(new TypeError("Network request failed")),
                    ontimeout: () => reject(new TypeError("Network request failed")),
                });
            } catch (e) {
                reject(e);
            }
        });
    };

    // --- XMLHttpRequest wrapper using GM_xmlhttpRequest ---
    class GMXHR {
        constructor() {
            this.readyState = 0;
            this.status = 0;
            this.statusText = "";
            this.response = null;
            this.responseText = "";
            this.responseType = "";
            this.onreadystatechange = null;
            this.onload = null;
            this.onerror = null;
            this._headers = {};
        }

        open(method, url, async = true) {
            this._method = method;
            this._url = url;
            this.readyState = 1;
            if (this.onreadystatechange) this.onreadystatechange();
        }

        setRequestHeader(name, value) {
            this._headers[name] = value;
        }

        send(body = null) {
            GM_xmlhttpRequest({
                url: this._url,
                method: this._method,
                headers: this._headers,
                data: body,
                responseType: "text",
                onload: res => {
                    this.readyState = 4;
                    this.status = res.status;
                    this.statusText = res.statusText;
                    this.responseText = res.responseText;
                    this.response = res.responseText;
                    if (this.onreadystatechange) this.onreadystatechange();
                    if (this.onload) this.onload();
                },
                onerror: res => {
                    this.readyState = 4;
                    this.status = 0;
                    if (this.onreadystatechange) this.onreadystatechange();
                    if (this.onerror) this.onerror(res);
                }
            });
        }

        abort() { }
        getAllResponseHeaders() { return ""; }
        getResponseHeader() { return null; }
    }

    window.XMLHttpRequest = GMXHR;

})();
