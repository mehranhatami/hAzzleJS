// xhr.js

var hAzzle = window.hAzzle || (window.hAzzle = {});

hAzzle.define('xhr', function() {

    var
        win = window,
        doc = win.document,

        // Modules

        _util = hAzzle.require('Util'),
        _detection = hAzzle.require('detection'),
        _jsonxml = hAzzle.require('Jsonxml'),
        _types = hAzzle.require('Types'),

        // Regex

        _s20 = /%20/g,
        _bracket = /\[\]$/,
        _https = /^http/,
        _protocol = /(^\w+):\/\//,
        _hash = /#.*$/,
        _protocolDash = /^\/\//,
        _url = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,

        _ajaxLocation = location.href,
        _ajaxLocParts = _url.exec(_ajaxLocation.toLowerCase()) || [],

        _head = doc.head || doc.getElementsByTagName('head')[0],
        _uniqid = 0,
        _callbackPrefix = 'xhr_' + _util.now,
        _lastValue,

        _accepts = {
            '*': 'text/javascript, text/html, application/xml, text/xml, */*',
            'xml': 'application/xml, text/xml',
            'html': 'text/html',
            'text': 'text/plain',
            'json': 'application/json, text/javascript',
        },

        _defaultHeaders = {
            'contentType': 'application/x-www-form-urlencoded; charset=UTF-8',
            'requestedWith': 'XMLHttpRequest'
        },
        _createXhr = function(options) {
            if (options.crossOrigin === true) {
                var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : null;
                if (xhr && 'withCredentials' in xhr) {
                    return xhr;
                } else {
                    hAzzle.err(true, 16, 'Browser does not support cross-origin requests');
                }
            } else if (window.XMLHttpRequest) {
                return new XMLHttpRequest();
            } else {
                hAzzle.err(true, 15, 'This browser does not support XMLHttpRequest');
            }
        },
        xhrHooks = {
            dataFilter: function(data) {
                return data;
            }
        },

        // Serialize an array of form elements or a set of
        // key/values into a query string  

        toQueryString = function(options, trad) {
            var prefix, i, traditional = trad || false,
                s = [],
                enc = encodeURIComponent,
                add = function(key, value) {
                    // If value is a function, invoke it and return its value
                    value = (typeof value === 'function') ? value() : (value == null ? '' : value);
                    s[s.length] = enc(key) + '=' + enc(value);
                };

            // If an array was passed in, assume that it is an array of form elements.
            if (_types.isArray(options)) {
                for (i = 0; options && i < options.length; i++) {
                    add(options[i].name, options[i].value);
                }
            } else {

                for (prefix in options) {
                    if (options.hasOwnProperty(prefix)) {
                        buildParams(prefix, options[prefix], traditional, add);
                    }
                }
            }

            // Return the resulting serialization
            return s.join('&').replace(_s20, '+');
        },

        buildParams = function(prefix, obj, trad, add) {
            var name, i, v;

            if (hAzzle.isArray(obj)) {
                // Serialize array item.
                for (i = 0; obj && i < obj.length; i++) {
                    v = obj[i];
                    if (trad || _bracket.test(prefix)) {
                        // Treat each array item as a scalar.
                        add(prefix, v);
                    } else {
                        buildParams(prefix + '[' + (typeof v === 'object' ? i : '') + ']',
                            v,
                            trad,
                            add);
                    }
                }
            } else if (!trad && obj.toString() === '[object Object]') {
                // Serialize object item.
                for (name in obj) {
                    buildParams(prefix + '[' + name + ']', obj[name], trad, add);
                }

            } else {
                // Serialize scalar item.
                add(prefix, obj);
            }
        },

        get_callbackPrefix = function() {
            return _callbackPrefix;
        },

        xhrSetup = function(options) {
            var k;
            options = options || {};
            for (k in options) {
                xhrHooks[k] = options[k];
            }
        },

        handleReadyState = function(obj, success, error) {

            return function() {

                var xhr = obj.request,
                    state = xhr.status,
                    protocol = _protocol.exec(obj.url);

                if (obj.aborted) {
                    return error(xhr);
                }
                if (xhr && xhr.readyState === 4) {

                    xhr.onreadystatechange = _util.noop;

                    protocol = (protocol && protocol[1]) || window.location.protocol;

                    if (_https.test(protocol)) {
                        // normalize IE bug (http://bugs.jquery.com/ticket/1450)     
                        state === 1223 ? 204 : state;
                    } else {
                        state = !!xhr.response;
                    }

                    if (state) {
                        success(xhr);
                    } else {
                        error(xhr);
                    }
                }
            };
        },

        generalCallback = function(data) {
            _lastValue = data;
        },

        // Note! Use of native indexOf are slower, so we are using the internal one

        createURL = function(url, data) {
            return url += (~_util.indexOf(url, '?') ? '&' : '?') + data;
        },

        jsonpReq = function(options, fn, err, url) {
            var jsonPID = _uniqid++,
                cbkey = options.jsonpCallback || 'callback', // the 'callback' key
                cbval = options.jsonpCallbackName || get_callbackPrefix(jsonPID),
                cbreg = new RegExp('((^|\\?|&)' + cbkey + ')=([^&]+)'),
                match = url.match(cbreg),
                script = doc.createElement('script'),
                loaded = 0;

            if (match) {
                if (match[3] === '?') {
                    url = url.replace(cbreg, '$1=' + cbval);
                } else {
                    cbval = match[3];
                }
            } else {
                url = createURL(url, cbkey + '=' + cbval);
            }

            win.cbval = generalCallback;

            script.type = 'text/javascript';
            script.src = url;
            script.async = true;

            if (typeof script.onreadystatechange !== 'undefined' && _detection.ie !== 10) {
                script.event = 'onclick';
                script.htmlFor = script.id = '_xhr_' + jsonPID;
            }

            script.onload = script.onreadystatechange = function() {

                if ((script.readyState && script.readyState !== 'complete' && script.readyState !== 'loaded') || loaded) {
                    return false;
                }

                script.onload = script.onreadystatechange = null;
                script.onclick && script.onclick();
                // Call the user callback with the last value stored and clean up values and scripts.
                fn(_lastValue);
                _lastValue = undefined;
                _head.removeChild(script);
                loaded = 1;
            };

            // Add the script to the DOM head
            _head.appendChild(script);

            // Enable JSONP timeout
            return {
                abort: function() {
                    script.onload = script.onreadystatechange = null;
                    err({}, 'Request is aborted: timeout', {});
                    _lastValue = undefined;
                    _head.removeChild(script);
                    loaded = 1;
                }
            };
        },

        getRequest = function(fn, err) {
            var options = this.options,
                method = (options.method || /*DEFAULT*/ 'GET').toUpperCase(),

                // Make sure we are working with correct URL

                url = (((typeof options === 'string' ? options : options.url) || _ajaxLocation) + '')
                .replace(_hash, '')
                .replace(_protocolDash, _ajaxLocParts[1] + '//'),
                data = (options.processData !== false && options.data && typeof options.data !== 'string') ?
                toQueryString(options.data) : (options.data || null),
                http,
                sendWait = false;

            // if we're working on a GET request and we have data then we should append
            // query string to end of URL and not post data
            if ((options.type === 'jsonp' || method === 'GET') && data) {
                url = createURL(url, data);
                data = null;
            }

            if (options.type === 'jsonp') {
                return jsonpReq(options, fn, err, url);
            }

            http = _createXhr(options);
            http.open(method, url, true);

            var headers = options.headers || {};

            headers.Accept = headers.Accept || _accepts[options.type] || _accepts['*'];

            var isAFormData = typeof FormData === 'function' && (options.data instanceof FormData);

            if (!options.crossOrigin && !headers['X-Requested-With']) {
                headers['X-Requested-With'] = _defaultHeaders['X-Requested-With'];
            }

            if (!headers.contentType && !isAFormData) {
                headers.contentType = options.contentType ||
                    _defaultHeaders.contentType;
            }

            _util.each(headers, function(value, key) {
                if (typeof value !== 'undefined') {
                    http.setRequestHeader(key, value);
                }
            });

            if (typeof options.withCredentials !== 'undefined' && typeof http.withCredentials !== 'undefined') {
                http.withCredentials = !!options.withCredentials;
            }

            if (win['XDomainRequest'] && http instanceof win['XDomainRequest']) {
                http.onload = fn;
                http.onerror = err;
                http.onprogress = function() {};
                sendWait = true;
            } else {
                http.onreadystatechange = handleReadyState(this, fn, err);
            }

            options.before && options.before(http);

            if (sendWait) {
                setTimeout(function() {
                    http.send(data);
                }, 200);
            } else {
                http.send(data);
            }
            return http;
        },
        XHR = function(options, fn) {
            return new XHR.prototype.init(options, fn);
        },

        setType = function(header) {
            // json, javascript, text/plain, text/html, xml
            if (header.match('json')) {
                return 'json';
            }
            if (header.match('javascript')) {
                return 'js';
            }
            if (header.match('text')) {
                return 'html';
            }
            if (header.match('xml')) {
                return 'xml';
            }
        },

        post = function(url, data, success, error, type) {
            if (type === undefined && _types.isString(error)) {
                type = error;
                error = false;
            }
            return typeof success === 'function' ? XHR({
                url: url,
                data: data,
                method: 'post',
                type: type,
                success: success,
                error: error ? error : _util.noop
            }) : '';
        },
        get = function(url, data, success, error, type) {
            if (type === undefined && _types.isString(error)) {
                type = error;
                error = false;
            }
            return typeof success === 'function' ? XHR({
                url: url,
                data: data,
                method: 'get',
                type: type,
                success: success,
                error: error ? error : _util.noop
            }) : '';
        };

    XHR.prototype = {

        init: function(options, fn) {

            this.options = options;
            this.fn = fn;
            this.url = typeof options === 'string' ? options : options.url;
            this.timeout = null;
            this.fulfilled = false;
            this.successHandler = function() {};
            this.fulfillmentHandlers = [];
            this.errorHandlers = [];
            this.completeHandlers = [];
            this.errorMsg = false;
            this.responseArgs = {};

            var self = this;

            fn = fn || function() {};

            if (options.timeout) {
                this.timeout = setTimeout(function() {
                    self.abort();
                }, options.timeout);
            }

            if (options.success) {
                this.successHandler = function() {
                    options.success.apply(options, arguments);
                };
            }

            if (options.error) {
                this.errorHandlers.push(function() {
                    options.error.apply(options, arguments);
                });
            }

            if (options.complete) {
                this.completeHandlers.push(function() {
                    options.complete.apply(options, arguments);
                });
            }

            function complete(resp) {
                options.timeout && clearTimeout(self.timeout);
                self.timeout = null;
                while (self.completeHandlers.length > 0) {
                    self.completeHandlers.shift()(resp);
                }
            }

            function success(xhr) {
                var type = options.type || xhr && setType(xhr.getResponseHeader('Content-Type')),
                    resp, filteredResponse, data;

                xhr = (type !== 'jsonp') ? self.request : xhr;

                // responseText is the old-school way of retrieving response (supported by IE8 & 9)
                // response/responseType properties were introduced in XHR Level2 spec (supported by IE10)

                resp = ('response' in xhr) ? xhr.response : xhr.responseText;

                // Use global data filter on response text

                filteredResponse = xhrHooks.dataFilter(resp, type);
                data = filteredResponse;

                xhr.responseText = data;

                // Dependencies: jsonxml.js module required

                if (data || data === '') {
                    if (type === 'json') {
                        xhr = JSON.parse(data + '');
                    } else if (type === 'html') {
                        xhr = data;
                    } else if (type === 'xml') {
                        if (hAzzle.installed.Jsonxml !== undefined) {
                            xhr = _jsonxml.parseXML(xhr.responseXML);
                        } else {
                            hAzzle.err(true, 18, "Can't complete the XML request - Jsonxml.js module not installed");
                        }
                    }
                }

                self.responseArgs.resp = xhr;
                self.fulfilled = true;
                fn(xhr);
                self.successHandler(xhr);
                while (self.fulfillmentHandlers.length > 0) {
                    xhr = self.fulfillmentHandlers.shift()(xhr);
                }

                complete(xhr);
            }

            function error(resp, msg, t) {
                resp = self.request;
                self.responseArgs.resp = resp;
                self.responseArgs.msg = msg;
                self.responseArgs.t = t;
                self.errorMsg = true;
                while (self.errorHandlers.length > 0) {
                    self.errorHandlers.shift()(resp, msg, t);
                }
                complete(resp);
            }

            this.request = getRequest.call(this, success, error);
        },

        abort: function() {
            this.aborted = true;
            this.request.abort();
        },

        retry: function() {
            this.init(this.options, this.fn);
        },

        then: function(success, fail) {
            success = success || function() {};
            fail = fail || function() {};
            if (this.fulfilled) {
                this.responseArgs.resp = success(this.responseArgs.resp);

            } else if (this.errorMsg) {
                fail(this.responseArgs.resp, this.responseArgs.msg, this.responseArgs.t);
            } else {
                this.fulfillmentHandlers.push(success);
                this.errorHandlers.push(fail);
            }
            return this;
        },

        always: function(fn) {
            if (this.fulfilled || this.errorMsg) {
                fn(this.responseArgs.resp);
            } else {
                this.completeHandlers.push(fn);
            }
            return this;
        },

        fail: function(fn) {
            if (this.errorMsg) {
                fn(this.responseArgs.resp, this.responseArgs.msg, this.responseArgs.t);
            } else {
                this.errorHandlers.push(fn);
            }
            return this;
        },
        'catch': function(fn) {
            return this.fail(fn);
        }
    };

    XHR.prototype.init.prototype = XHR.prototype;

    return {

        xhr: XHR,
        post: post,
        get: get,
        xhrSetup: xhrSetup,
        buildParams: buildParams,
        toQueryString: toQueryString,
        xhrHooks: xhrHooks
    };
});