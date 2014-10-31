// xhr.js
// Dependencies: Jsonxml.js module
var hAzzle = window.hAzzle || (window.hAzzle = {});

hAzzle.define('xhr', function() {

    var
    // Modules

        _util = hAzzle.require('Util'),
        _types = hAzzle.require('Types'),
        // Note! This module are not part of the Core
        _jxml = hAzzle.require('Jsonxml'),

        // Use native Promise library

        Promise = window.Promise,

        responseTypes = {
            "text/plain": 'text',
            "text/html": 'html',
            "application/xml, 'text/xml": 'xml',
            "application/json, 'text/javascript": 'json'
        },

        createXhr = function(method) {
            if (window.XMLHttpRequest) {
                return new window.XMLHttpRequest();
            }

            hAzzle.err(true, 1, 'This browser does not support XMLHttpRequest.');
        },


        // - method can either be 'post' or 'get'

        XHR = function(method, url, config) {

            config = config || {};

            method = method.toUpperCase();

            var headers = config.headers || {},
                charset = 'charset' in config ? config.charset : XHR.defaults.charset,
                cacheBurst = 'cacheBurst' in config ? config.cacheBurst : XHR.defaults.cacheBurst,
                data = config.data;

            if (_types.isType('Object')(data)) {
                data = Object.keys(data).reduce(function(memo, key) {
                    var name = encodeURIComponent(key),
                        value = data[key];

                    if (Array.isArray(value)) {
                        value.forEach(function(value) {
                            memo.push(name + '=' + encodeURIComponent(value));
                        });
                    } else {
                        memo.push(name + '=' + encodeURIComponent(value));
                    }

                    return memo;
                }, []).join('&').replace(/%20/g, '+');
            }

            if (typeof data === 'string') {
                if (method === 'GET') {
                    url += (~url.indexOf('?') ? '&' : '?') + data;

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
                url += (~url.indexOf('?') ? '&' : '?') + cacheBurst + '=' + Date.now();
            }

            return new Promise(function(resolve, reject) {

                // Create new XHR request

                var xhr = createXhr();

                xhr.open(method, url, true);

                xhr.timeout = config.timeout || XHR.defaults.timeout;

                _util.each(XHR.defaults.headers, function(value, key) {
                    if (!(key in headers)) {
                        headers[key] = XHR.defaults.headers[key];
                    }
                });

                _util.each(headers, function(value, key) {
                    if (_types.isDefined(value)) {
                        xhr.setRequestHeader(key, value);
                    }
                });

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
                        var status = xhr.status,
                            statusText, resp,
                            response, responseHeaders;

                        responseHeaders = xhr.getAllResponseHeaders()

                        // responseText is the old-school way of retrieving response (supported by IE8 & 9)
                        // response/responseType properties were introduced in XHR Level2 spec (supported by IE10)

                        response = ('response' in xhr) ? xhr.response : xhr.responseText;

                        statusText = xhr.statusText || '';

                        // normalize IE bug (http://bugs.jquery.com/ticket/1450)

                        status = status === 1223 ? 204 : status;

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

                                        hAzzle.err(hAzzle.installed['Jsonxml'], 21, 'Jsonxml.js module needed for xml in xhr()');
                                        resp = _jxml.parseXML(response)
                                        break
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