// xhr.js
// Dependencies: Jsonxml.js module
var hAzzle = window.hAzzle || (window.hAzzle = {});

hAzzle.define('xhr', function() {

    var
    // Modules

        _util = hAzzle.require('Util'),
        _types = hAzzle.require('Types'),
        _collection = hAzzle.require('Collection'),
        // Note! This module are not part of the Core
        _jxml = hAzzle.require('Jsonxml'),

        _keys = Object.keys,

        r20 = /%20/g,

        // Use native Promise library

        Promise = window.Promise,

        responseTypes = {
            "text/plain": 'text',
            "text/html": 'html',
            "application/xml, 'text/xml": 'xml',
            "application/json, 'text/javascript": 'json'
        },

        xhrSuccessStatus = {
            // file protocol always yields status code 0, assume 200
            0: 200,
            // Support: IE9
            // #1450: sometimes IE returns 1223 when it should be 204
            1223: 204
        },

        createXhr = function() {
            hAzzle.err(!window.XMLHttpRequest, 20, 'This browser does not support XMLHttpRequest.');
            return new window.XMLHttpRequest();
        },

        urlappend = function(url, data) {
            return url + (/\?/.test(url) ? '&' : '?') + data;
        },
        // - method can either be 'post' or 'get'

        XHR = function(method, url, config) {

            config = config || {};

            method = method.toUpperCase();

            var headers = config.headers || {},
                charset = config.charset || XHR.defaults.charset,
                cacheBurst = config.cacheBurst || XHR.defaults.cacheBurst,
                data = config.data;

            if (_types.isType('Object')(data)) {

                data = _collection.reduce(_keys(data), function(memo, key) {

                    var enc = encodeURIComponent,
                        name = enc(key),
                        value = data[key];

                    // If an array was passed in, assume that it is an array of form elements.

                    if (_types.isArray(value)) {
                        _util.each(value, function(value) {
                            memo.push(name + '=' + enc(value));
                        });
                    } else {
                        memo.push(name + '=' + enc(value));
                    }

                    return memo;
                }, []).join('&').replace(r20, '+');
            }

            // if we're working on a GET request and we have data then we should append
            // query string to end of URL and not post data

            if (typeof data === 'string') {
                if (method === 'GET') {
                    url = urlappend(url, data);
                    data = null;
                } else {
                    headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=' + charset;
                }
            }

            if (_types.isType('Object')(config.json)) {
                data = JSON.stringify(config.json);

                headers['Content-Type'] = 'application/json; charset=' + charset;
            }

            if (cacheBurst && method === 'GET') {
                url = urlappend(url, cacheBurst) + '=' + Date.now();
            }

            return new Promise(function(resolve, reject) {

                // Create new XHR request

                var i, xhr = createXhr();

                xhr.open(method,
                    url,
                    config.async || true,
                    config.username || '',
                    config.password || '');

                xhr.timeout = config.timeout || XHR.defaults.timeout;

                // Override mime type if needed

                if (config.mimeType && xhr.overrideMimeType) {
                    xhr.overrideMimeType(config.mimeType);
                }

                _util.each(XHR.defaults.headers, function(value, key) {
                    if (!(key in headers)) {
                        headers[key] = XHR.defaults.headers[key];
                    }
                });

                if (!config.crossDomain && !headers['X-Requested-With']) {
                    headers['X-Requested-With'] = 'XMLHttpRequest';
                }

                // Set headers

                for (i in headers) {
                    if (typeof headers[i] !== 'undefined') {
                        xhr.setRequestHeader(i, headers[i]);
                    }
                }

                xhr.onabort = function() {
                    reject(new Error('abort'));
                };
                xhr.onerror = function() {
                    reject(new Error('fail'));
                };
                xhr.ontimeout = function() {
                    reject(new Error('timeout'));
                };
                xhr.onreadystatechange = function() {

                    if (xhr && xhr.readyState === 4) {
                        var status = xhrSuccessStatus[xhr.status] || xhr.status,
                            statusText = xhr.statusText || '',
                            resp, type,
                            
                        // responseText is the old-school way of retrieving response (supported by IE8 & 9)
                        // response/responseType properties were introduced in XHR Level2 spec (supported by IE10)

                        response = ('response' in xhr) ? xhr.response : xhr.responseText,

                        responseHeaders = xhr.getAllResponseHeaders();

                        // Determine if successfull

                        if (status >= 200 && status < 300 || status === 304) {

                            // if no content
                            if (status === 204) {
                                response = "nocontent";

                                // if not modified
                            } else if (status === 304) {
                                response = "notmodified";
                                // If we have data, let's convert it
                            } else {

                                type = responseTypes[xhr.getResponseHeader('Content-Type')];

                                switch (type) {
                                    case 'json':
                                        resp = window.JSON.parse(response + ' ');
                                        break;
                                    case 'html':
                                        resp = response;
                                        break;
                                    case 'xml':
                                        hAzzle.err(!hAzzle.installed.Jsonxml, 21, 'Jsonxml.js module needed for xml in xhr()');
                                        resp = _jxml.parseXML(response);
                                        break;
                                }
                            }

                            resolve(resp);

                        } else {
                            reject(response);
                        }
                    }
                };

                xhr.send(data || null);
            });
        };


    XHR.get = function(url, config) {
        return XHR('get', url, config);
    };

    XHR.post = function(url, config) {
        return XHR('post', url, config);
    };

    XHR.defaults = {
        timeout: 15000,
        cacheBurst: '_',
        charset: 'UTF-8',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    };

    return {
        xhr: XHR
    };
});