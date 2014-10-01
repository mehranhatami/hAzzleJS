// xhr.js
var win = window,
    doc = window.document,
    httpsRe = /^http/,
    rhash = /#.*$/,
    contentType = 'Content-Type',
    head = document.head,
    uniqid = 0,
    callbackPrefix = 'xhr_' + hAzzle.now(),
    lastValue,
    xmlHttpRequest = 'XMLHttpRequest',
    xDomainRequest = 'XDomainRequest',
    isFormDataSupported = typeof FormData === "function" || typeof FormData === "object",
    noop = function() {},

    defaultHeaders = {
        'contentType': 'application/x-www-form-urlencoded; charset=UTF-8',
        'requestedWith': xmlHttpRequest,
        'accept': {
            '*': 'text/javascript, text/html, application/xml, text/xml, */*',
            'xml': 'application/xml, text/xml',
            'html': 'text/html',
            'text': 'text/plain',
            'json': 'application/json, text/javascript',
            'js': 'application/javascript, text/javascript'
        }
    },

    createXhr = function(options) {
        if (options.crossOrigin === true) {
            var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : null;
            if (xhr && 'withCredentials' in xhr) {
                return xhr;
            } else {
                hAzzle.error('Browser does not support cross-origin requests');
            }
        } else if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        } else {
            hAzzle.error('This browser does not support XMLHttpRequest.');
        }
    },
    globalSetupOptions = {
        dataFilter: function(data) {
            return data;
        }
    },

    succeed = function(request) {
        if (httpsRe.test(window.location.protocol)) {
            var status = request.status;
            // normalize IE bug (http://bugs.jquery.com/ticket/1450)     
            return status === 1223 ? 204 : status;
        } else {
            return !!request.response;
        }
    },

    handleReadyState = function(r, success, error) {
        alert(r)
        return function() {
            // use aborted to mitigate against IE err c00c023f
            // (can't read props on aborted request objects)
            if (r.aborted) {
                return error(r.request);
            }
            if (r.request && r.request.readyState == 4) {
                r.request.onreadystatechange = noop;
                if (succeed(r.request)) {
                    success(r.request);
                } else {
                    error(r.request);
                }
            }
        };
    },

    setHeaders = function(http, options) {

        var headers = options.headers || {},
            h;

        headers.Accept = headers.Accept ||
            defaultHeaders.accept[options.type] ||
            defaultHeaders.accept['*'];

        var isAFormData = isFormDataSupported && (options.data instanceof FormData);

        if (!options.crossOrigin && !headers.requestedWith) {
            headers.requestedWith = defaultHeaders.requestedWith;
        }

        if (!headers[contentType] && !isAFormData) {
            headers[contentType] = options.contentType ||
                defaultHeaders.contentType;
        }

        for (h in headers) {
            headers.hasOwnProperty(h) && 'setRequestHeader' in http && http.setRequestHeader(h, headers[h]);
        }
    },

    setCredentials = function(http, options) {
        if (typeof options.withCredentials !== 'undefined' && typeof http.withCredentials !== 'undefined') {
            http.withCredentials = !!options.withCredentials;
        }
    },

    generalCallback = function(data) {
        lastValue = data;
    },

    urlappend = function(url, s) {
        return (url + '').replace(rhash, '') + (/\?/.test(url) ? '&' : '?') + s;
        ////			.replace( /^\/\//, ajaxLocParts[ 1 ] + "//" );
    },

    handleJsonp = function(o, fn, err, url) {
        var reqId = uniqid++,
            cbkey = o.jsonpCallback || 'callback',
            cbval = o.jsonpCallbackName || hAzzle.getcallbackPrefix(reqId),
            cbreg = new RegExp('((^|\\?|&)' + cbkey + ')=([^&]+)'),
            match = url.match(cbreg),
            script = doc.createElement('script'),
            loaded = 0;

        if (match) {
            if (match[3] === '?') {
                url = url.replace(cbreg, '$1=' + cbval); // wildcard callback func name
            } else {
                cbval = match[3]; // provided callback func name
            }
        } else {
            url = urlappend(url, cbkey + '=' + cbval); // no callback details, add 'em
        }

        win[cbval] = generalCallback;

        script.type = 'text/javascript';
        script.src = url;
        script.async = true;
        if (typeof script.onreadystatechange !== 'undefined' && !hAzzle.ie === 10) {
            script.htmlFor = script.id = '[__hAzzle__]' + reqId;
        }

        script.onload = script.onreadystatechange = function() {
            if ((script.readyState && script.readyState !== 'complete' && script.readyState !== 'loaded') || loaded) {
                return false;
            }
            script.onload = script.onreadystatechange = null;
            script.onclick && script.onclick();
            // Call the user callback with the last value stored and clean up values and scripts.
            fn(lastValue);
            lastValue = undefined;
            head.removeChild(script);
            loaded = 1;
        };

        // Add the script to the DOM head
        head.appendChild(script);

        // Enable JSONP timeout
        return {
            abort: function() {
                script.onload = script.onreadystatechange = null;
                err({}, 'Request is aborted: timeout', {});
                lastValue = undefined;
                head.removeChild(script);
                loaded = 1;
            }
        };
    },

    getRequest = function(fn, err) {
        var o = this.o,
            method = (o.method || 'GET').toUpperCase(),
            url = typeof o === 'string' ? o : o.url,
            data = (o.processData !== false && o.data && typeof o.data !== 'string') ? hAzzle.toQueryString(o.data) : (o.data || null),
            http, sendWait = false;

        // if we're working on a GET request and we have data then we should append
        // query string to end of URL and not post data
        if ((o.type == 'jsonp' || method == 'GET') && data) {
            url = urlappend(url, data);
            data = null;
        }

        if (o.type == 'jsonp') {
            return handleJsonp(o, fn, err, url);
        }

        // get the xhr from the factory if passed
        // if the factory returns null, fall-back to ours
        http = (o.xhr && o.xhr(o)) || createXhr(o);

        http.open(method, url, o.async === false ? false : true);
        setHeaders(http, o);
        setCredentials(http, o);

        if (window.XDomainRequest && http instanceof window.XDomainRequest) {
            http.onload = fn;
            http.onerror = err;
            http.onprogress = function() {};
            sendWait = true;
        } else {
            http.onreadystatechange = handleReadyState(this, fn, err);
        }

        if (o.before) {
            o.before(http);
        }

        if (sendWait) {
            setTimeout(function() {
                http.send(data);
            }, 200);
        } else {
            http.send(data);
        }
        return http;
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

    // Prototype

    XHR = function(o, fn) {
        return new XHR.prototype.init(o, fn);
    }



XHR.prototype = {
    constructor: XHR,
    init: function(o, fn) {

        this.o = o;
        this.fn = fn;
        this.url = typeof o == 'string' ? o : o.url;
        this.timeout = null;
        this._fulfilled = false;
        this.successHandler = function() {};
        this.fulfillmentHandlers = [];
        this.errorHandlers = [];
        this.completeHandlers = [];
        this.erred = false;
        this.responseArgs = {};

        var self = this;

        fn = fn || function() {};

        if (o.timeout) {
            this.timeout = setTimeout(function() {
                self.abort();
            }, o.timeout);
        }

        if (o.success) {
            this.successHandler = function() {
                o.success.apply(o, arguments);
            };
        }

        if (o.error) {
            this.errorHandlers.push(function() {
                o.error.apply(o, arguments);
            });
        }

        if (o.complete) {
            this.completeHandlers.push(function() {
                o.complete.apply(o, arguments);
            });
        }

        function complete(resp) {
            o.timeout && clearTimeout(self.timeout);
            self.timeout = null;
            while (self.completeHandlers.length > 0) {
                self.completeHandlers.shift()(resp);
            }
        }

        function success(resp) {

            var type = o.type || setType(resp.getResponseHeader('Content-Type'));
            resp = (type !== 'jsonp') ? self.request : resp;


            // responseText is the old-school way of retrieving response (supported by IE8 & 9)
            // response/responseType properties were introduced in XHR Level2 spec (supported by IE10)
            var response = ('response' in resp) ? resp.response : resp.responseText;

            // use global data filter on response text

            var filteredResponse = globalSetupOptions.dataFilter(response, type),
                r = filteredResponse;

            resp.responseText = r;

            if (r || r === '') {
                switch (type) {
                    case 'json':
                        resp = win.JSON.parse(r);
                        break;
                    case 'html':
                        resp = r;
                        break;
                    case 'xml':
                        resp = resp.responseXML && resp.responseXML.parseError && resp.responseXML.parseError.errorCode && resp.responseXML.parseError.reason ? null : resp.responseXML;
                        break;
                }
            }

            self.responseArgs.resp = resp;
            self._fulfilled = true;
            fn(resp);
            self.successHandler(resp);
            while (self.fulfillmentHandlers.length > 0) {
                resp = self.fulfillmentHandlers.shift()(resp);
            }

            complete(resp);
        }

        function error(resp, msg, t) {
            resp = self.request;
            self.responseArgs.resp = resp;
            self.responseArgs.msg = msg;
            self.responseArgs.t = t;
            self.erred = true;
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
        this.init(this.o, this.fn);
    },
    then: function(success, fail) {
        success = success || function() {};
        fail = fail || function() {};
        if (this._fulfilled) {
            this.responseArgs.resp = success(this.responseArgs.resp);
        } else if (this.erred) {
            fail(this.responseArgs.resp, this.responseArgs.msg, this.responseArgs.t);
        } else {
            this.fulfillmentHandlers.push(success);
            this.errorHandlers.push(fail);
        }
        return this;
    },

    always: function(fn) {
        if (this._fulfilled || this.erred) {
            fn(this.responseArgs.resp);
        } else {
            this.completeHandlers.push(fn);
        }
        return this;
    },

    fail: function(fn) {
        if (this.erred) {
            fn(this.responseArgs.resp, this.responseArgs.msg, this.responseArgs.t);
        } else {
            this.errorHandlers.push(fn);
        }
        return this;
    },
    catch: function(fn) {
        return this.fail(fn);
    }
};

XHR.prototype.init.prototype = XHR.prototype;

hAzzle.extend({

    ajaxSettings: {

        url: '',
        type: 'GET',
        contentType: "application/x-www-form-urlencoded; charset=UTF-8"
    },

    xhr: XHR,

    getcallbackPrefix: function() {
        return callbackPrefix;
    },

    ajaxSetup: function(options) {

        options = options || {}

        for (var k in options) {
            globalSetupOptions[k] = options[k];
        }
    }

}, hAzzle);