var win = window,
    doc = win.document,
    uniqid = 0,

    slice = Array.prototype.slice,

    expando = hAzzle.expando,

    lastValue, // data stored by the most recent JSONP callback

    headerTypes = {
        'text/plain': 'html',
        'text/html': 'html',
        'application/xml': 'xml',
        'text/xml': 'xml',
        'application/json': 'json',
        'text/javascript': 'json',
        'application/json, text/javascript': 'json',
    },

    ie10 = navigator.userAgent.indexOf('MSIE 10.0') !== -1,
    // Usefull regEx

    query = (/\?/),
    r20 = /%20/g,
    normalize = /\r?\n/g,
    submittable = /^(?:input|select|textarea|keygen)/i,
    submitterTypes = /^(?:submit|button|image|reset|file)$/i,
    checkbox = /^checkbox/i,
    radio = /^radio/i,

    isArray = hAzzle.isArray,

    accepts = {
        "*": 'text/javascript, text/html, application/xml, text/xml, */*',
        text: "text/plain",
        html: "text/html",
        xml: "application/xml, text/xml",
        json: "application/json;charset=utf-8, text/javascript"
    },

    xhr = function (options) {

        if (options.crossOrigin === true) {

            var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : null;

            if (xhr && 'withCredentials' in xhr) {

                return xhr;
                // Mehran!! Fix this and use Cors
            } else if (win.XDomainRequest) {

                return new XDomainRequest();

            } else {

                hAzzle.error('Browser does not support cross-origin requests');
            }

        } else if (win.XMLHttpRequest) {

            return new XMLHttpRequest();
        }
    },

    AjaxCore = {

        version: '0.0.2',

        has: {

            // Mehran!  I added feature check for CORS here
            // You fix!!

            'api-cors': !!xhr && ("withCredentials" in xhr),
            'api-ajax': !!xhr,
			'api-formDataSupport': typeof FormData === "function" || typeof FormData === "object"
        },

        /**
         * Ajax method to create ajax request with XMLHTTPRequest
         * Support for JSONP && Cross domain
         *
         * @param {String|Object} options
         * @param {Function} fn
         * @return {hAzzle}
         */

        xmlhttp: function (options, fn) {

            var self = this;
            self.options = options;
            self.fn = fn;

            // prepeare for xmlhttp requests

            init.apply(this, arguments);
        },

        /**
         * Default ajax settings.
         */
        ajaxSettings: {

            // The url to make request to. If empty no request will be made.

            url: '',

            // Modify the xhr object before open it. Default is null.

            before: null,

            // Modify the xhr object before send. Default is null.

            sendWait: null,

            // The type of the request. Default is GET.

            type: "GET",

            // if set to 'true', it will not be recognized

            async: 1,

            // Tell server witch content type it is.

            contentType: "application/x-www-form-urlencoded; charset=utf-8",

            // default: html

            dataType: 'html',

            // Set a timeout (in milliseconds) for the request.

            timeout: 1500,

            // Data that is send to the server.
            // Can be: json, jsonp, html, text, xml.

            data: {},

            // Function that runs on a successful request.
            // Takes on argument, the response.

            success: hAzzle.noop,

            crossOrigin: false,

            // Error function that is called on failed request.
            // Take to arguments, xhr and the options object.

            error: hAzzle.noop,

            complete: hAzzle.noop,

            // An object of additional header key/value pairs to send along with the request
            headers: {

                'requestedWith': 'XMLHttpRequest'
            }
        }
    };

/* =========================== AJAX PROTOTYPE CHAIN ========================== */

AjaxCore.xmlhttp.prototype = {

    // About requests

    abort: function () {
        this._aborted = true;
        this.request.abort();
    },

    // Try again!

    retry: function () {
        init.call(this, this.options, this.fn);
    },
    // Add handlers to be called when the request is resolved, rejected, or still in progress.
    then: function (ajaxHandleResponses, fail) {

        ajaxHandleResponses = ajaxHandleResponses || function () {};
        fail = fail || function () {};

        if (this._done) {

            this._respArgs.resp = ajaxHandleResponses(this._respArgs.resp);

        } else if (this._erred) {

            fail(this._respArgs.resp, this._respArgs.msg, this._respArgs.t);

        } else {

            this._doneHandlers.push(ajaxHandleResponses);
            this._errorHandlers.push(fail);
        }
        return this;
    },

    // Add handlers to be called when the request is either resolved or rejected. 

    always: function (fn) {

        if (this._done || this._erred) {

            fn(this._respArgs.resp);

        } else {

            this._completeHandlers.push(fn);
        }

        return this;
    },

    // fail will execute when the request fails

    fail: function (fn) {

        if (this._erred) {

            fn(this._respArgs.resp, this._respArgs.msg, this._respArgs.t);

        } else {

            this._errorHandlers.push(fn);
        }

        return this;
    },

    catch: function (fn) {
        return this.fail(fn);
    }
};

function gC(data) {
    lastValue = data;
}

function jsonpReq(options, fn, err, url) {
    var reqId = uniqid++,
        cbkey = options.jsonp || 'callback', // the 'callback' key
        cbval = options.jsonpCallback || AjaxCore.getexpando(reqId),
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

    win.cbval = gC;

    script.type = 'text/javascript';
    script.src = url;
    script.async = true;

    if (typeof script.onreadystatechange !== 'undefined' && !ie10) {

        script.event = 'onclick';
        script.htmlFor = script.id = '_xmlhttp_' + reqId;
    }

    script.onload = script.onreadystatechange = function () {

        if ((script.readyState && script.readyState !== 'complete' && script.readyState !== 'loaded') || loaded) {
            return false;
        }

        script.onload = script.onreadystatechange = null;
        if (script.onclick) {
            script.onclick();
        }

        // Call the user callback with the last value stored and clean up values and scripts.

        fn(lastValue);
        lastValue = undefined;
        doc.body.removeChild(script);
        loaded = 1;
    };

    // It's possible to add the script to the document head
    // instead of the 'body'. But only supported in HTML5,
    // and almost all major browsers

    doc.body.appendChild(script);

    // Enable JSONP timeout
    return {
        abort: function () {
            script.onload = script.onreadystatechange = null;
            err({}, 'Request is aborted: timeout', {});
            lastValue = undefined;
            doc.body.removeChild(script);
            loaded = 1;
        }
    };
}

function urlappend(url, s) {
    return s && (url + (query.test(url) ? '&' : '?') + s);
}

function getRequest(fn, err) {
    var opt = this.options,
        method = (opt.type || 'GET').toUpperCase(),
        headers = opt.headers || {},
        url = hAzzle.isString(opt) ? opt : opt.url,
        isAFD,
        data = (opt.processData !== false && opt.data && typeof opt.data !== 'string') ?
        AjaxCore.toQueryString(opt.data) : (opt.data || null),
        xhttp, sendWait = false;

    // if jsonp or get request, create query string

    if ((opt.dataType == 'jsonp' || method == 'GET') && data) {

        url = urlappend(url, data);
        data = null;
    }

    if (opt.dataType == 'jsonp') {

        return jsonpReq(opt, fn, err, url);
    }

    xhttp = xhr(opt);

    // Open the socket

    if (opt.username) {

        xhttp.open(method, url, opt.async === false ? false : true, opt.username, opt.password);

    } else {

        xhttp.open(method, url, opt.async === false ? false : true);
    }

     isAFD  = AjaxCore.has['api-formDataSupport'] && (opt.data instanceof FormData);

    // Set aaccept header

    headers.Accept = headers.Accept || accepts[opt.dataType] || accepts['*'];

    // Set contentType

    if (!headers.contentType && !isAFD ) {

        headers.contentType = opt.contentType;
    }

    // Set headers

    hAzzle.forOwn(headers, function (value, key) {
        // Make sure the value are 'defined' before
        // setting the headers
        if (hAzzle.isDefined(value)) {
            xhttp.setRequestHeader(key, value);
        }
    });

    // setCredentials
    // Todo!? Fix CORS

    if (typeof opt.withCredentials !== 'undefined' && typeof xhttp.withCredentials !== 'undefined') {

        xhttp.withCredentials = !!opt.withCredentials;
    }

    if (win.XDomainRequest && xhttp instanceof win.XDomainRequest) {

        xhttp.onload = fn;
        xhttp.onerror = err;
        xhttp.onprogress = function () {};
        sendWait = true;

    } else {

        // NOTE!! onreadystatechange might get called multiple times with 
        // readyState === 4 on mobile webkit. But only for Android 4.1 and
        // below. But hAzzle are not supposed to support so old versions
        // anyway

        var self = this;

        xhttp.onreadystatechange = function () {

            if (self._aborted) {

                return err(self.request);
            }

            if (self.request && self.request.readyState === 4) {

                var status = self.request.status;

                // normalize IE bug (http://bugs.jquery.com/ticket/1450)

                status = status === 1223 ? 204 : status;

                // Zero out onreadystatechange

                self.request.onreadystatechange = hAzzle.noop;

                if (status) {

                    fn(self.request);

                } else {

                    err(self.request);
                }
            }
        };
    }
    if (opt.before) {
        opt.before(xhttp);
    }

    if (sendWait) {

        setTimeout(function () {

            SendRequest(xhttp, data);

        }, 200);

    } else {

        SendRequest(xhttp, data);
    }

    // return

    return xhttp;
}

/**
 * Send XMLHTTP data
 *
 * @param {Object} xhttp
 * @param {String/Object} data
 *
 */

function SendRequest(xhttp, data) {

    try {
        // Avoid memory leak in IE, by sending
        // 'null' if no data
        xhttp.send(data || null);
    } catch (e) { /* Die silently !*/ }
}

/**
 * Prepeare the AJAX request
 *
 * @param{Object} o
 * @param{Function} fn
 */

function init(options, fn) {

    var self = this,
        opt;

    if (typeof options === 'string') {

        this.url = options;

    } else {

        this.url = options.url;
    }

    /**
     * Create the final options object - clone
     * the default ajaxsettings, IF
     * the default options are not set
     */

    for (opt in AjaxCore.ajaxSettings) {
        if (!options.hasOwnProperty(opt)) {
            options[opt] = AjaxCore.ajaxSettings[opt];
        }
    }

    this._done = false;
    this._successHandler = hAzzle.noop;
    this._doneHandlers = [];
    this._errorHandlers = [];
    this._completeHandlers = [];
    this._erred = false;
    this._respArgs = {};

    // set timeout
    // default: 1500

    self.timeout = setTimeout(function () {
        self.abort();
    }, options.timeout);

    // set up the handlers
    // default: hAzzle.noop

    this._successHandler = function () {
        options.success.apply(options, arguments);
    };
    this._errorHandlers.push(function () {
        options.error.apply(options, arguments);
    });
    this._completeHandlers.push(function () {
        options.complete.apply(options, arguments);
    });

    //
    fn = fn || hAzzle.noop;

    // Complete

    function complete(resp) {

        // Clear timeout if it exists

        if (self.timeout) {

            clearTimeout(self.timeout);
            self.timeout = null;
        }

        while (self._completeHandlers.length > 0) {

            self._completeHandlers.shift()(resp);
        }
    }

    /* Handles responses to an ajax request:
     * - finds the right dataType (mediates between content-type and expected dataType)
     * - returns the corresponding response
     *
     * @param {Object} resp
     *
     * @return {hAzzle}
     */

    function ajaxHandleResponses(resp) {

        var type = options.dataType || headerTypes[resp.getResponseHeader('Content-Type')],
            status = resp.status,

            // XHR Level 2 spec - supported by IE10 - introduced the new response/responseType properties. This are
            // - obviously - not working in IE9, so we do a litle 'magic'

            response = ('response' in resp) ? resp.response : resp.responseText;

        // if no content

        if (status === 204) {

            response = "nocontent";

            // if not modified

        } else if (status === 304) {

            response = "notmodified";
        }

        resp = (type !== 'jsonp') ? self.request : resp;

        if (resp) {

            // Parse text as JSON
            resp = type === 'json' ? hAzzle.parseJSON(response) :
                // Text to html
                type === 'html' ? response :
                // Parse text as xml
                type === 'xml' ? resp = hAzzle.parseXML(resp.responseXML) : '';
        }

        self._respArgs.resp = resp;
        self._done = true;
        fn(resp);
        self._successHandler(resp);
        while (self._doneHandlers.length > 0) {
            resp = self._doneHandlers.shift()(resp);
        }

        complete(resp);
    }

    function error(resp, msg, t) {
        resp = self.request;
        self._respArgs.resp = resp;
        self._respArgs.msg = msg;
        self._respArgs.t = t;
        self._erred = true;
        while (self._errorHandlers.length > 0) {
            self._errorHandlers.shift()(resp, msg, t);
        }
        complete(resp);
    }

    this.request = getRequest.call(this, ajaxHandleResponses, error);
}

function normalize(s) {

    return s ? s.replace(normalize, '\r\n') : '';
}

function serial(el, callback) {
    var n = el.name,
        t = el.nodeName,
        a = 0,
        len = el.length,
        // options callback
        optCallback = function (options) {
            if (options && !options.disabled) {
                callback(n, normalize(options.attributes.value && options.attributes.value.specified ? options.value : options.text));
            }
        },
        ch, ra, val, i;

    // don't serialize nameless or hidden elements

    if (el.disabled || !n) {
        return;
    }

    if (t === 'INPUT') {
        if (!submitterTypes.test(el.type)) {
            ch = checkbox.test(el.type);
            ra = radio.test(el.type);
            val = el.value;

            (!(ch || ra) || el.checked) && callback(n, normalize(ch && val === '' ? 'on' : val));
        }
    }

    // Do the Keygen only need to be normalized??

    if (t === 'TEXTAREA' || t === 'KEYGEN') {

        callback(n, normalize(el.value));
    }


    if (t === 'SELECT') {

        if (el.type.toLowerCase() === 'select-one') {

            optCallback(el.selectedIndex >= 0 ? el.options[el.selectedIndex] : null);

        } else {

            for (; i < len; i++) {

                if (el.options[a].selected) {

                    optCallback(el.options[a]);
                }
            }
        }

    }
}

function eachFormElement() {
    var cb = this,
        e, i, serializeSubtags = function (e, tags) {

            var i = 0,
                j = 0,
                l = tags.length,

                len, fa;

            for (; i < l; i++) {

                fa = e.getElementsByTagName(tags[i]);

                len = fa.length;

                for (; j < len; j++) {

                    serial(fa[j], cb);
                }
            }
        };

    for (i = 0; i < arguments.length; i++) {

        e = arguments[i];

        if (submittable.test(e.tagName)) {

            serial(e, cb);
        }

        serializeSubtags(e, ['input', 'select', 'textarea', 'keygen']);
    }

}

// standard query string style serialization
function serializeQueryString() {
    return AjaxCore.toQueryString(AjaxCore.serializeArray.apply(null, arguments));
}

// { 'name': 'value', ... } style serialization
function serializeHash() {
    var hash = {};
    eachFormElement.apply(function (name, value) {
        if (name in hash) {
            hash[name] && !isArray(hash[name]) && (hash[name] = [hash[name]]);
            hash[name].push(value);
        } else {
            hash[name] = value;
        }
    }, arguments);
    return hash;
}


AjaxCore.serializeArray = function () {

    var arr = [];

    eachFormElement.apply(function (name, value) {
        arr.push({
            name: name,
            value: value
        });
    }, arguments);
    return arr;
};

AjaxCore.serialize = function () {

    if (arguments.length === 0) {

        return '';
    }

    var opt, fn, args = slice.call(arguments, 0);

    opt = args.pop();
    opt && opt.nodeType && args.push(opt) && (opt = null);
    opt && (opt = opt.type);

    if (opt === 'map') {
        fn = serializeHash;
    } else if (opt == 'array') {
        fn = AjaxCore.serializeArray;
    } else {
        fn = serializeQueryString;
    }
    return fn.apply(null, args);
};


/**
 * Create a serialized representation of an array or object.
 *
 * @param {Array|Object} o
 * @param {Object} trad
 * @return {String}
 */

hAzzle.param = AjaxCore.toQueryString = function (o, trad) {
    var prefix, i = 0,
        l, traditional = trad || false,
        s = [],
        enc = encodeURIComponent,
        add = function (key, value) {
            // If value is a function, invoke it and return its value
            value = hAzzle.isFunction(value) ? value() : (value === null ? '' : value);
            s[s.length] = enc(key) + '=' + enc(value);
        };

    // If an array was passed in, assume that it is an array of form elements.

    if (isArray(o)) {
        l = o.length;

        for (; i < l; i++) {

            add(o[i].name, o[i].value);
        }
    } else {

        for (prefix in o) {
            if (o.hasOwnProperty(prefix)) {
                buildParams(prefix, o[prefix], traditional, add);
            }
        }
    }

    // Return the resulting serialization
    return s.join('&').replace(r20, '+');
};

function buildParams(prefix, obj, traditional, add) {
    var name, i = 0,
        l, v, rbracket = /\[\]$/;

    if (isArray(obj)) {
        // Serialize array item.
        l = obj.length;
        for (; i < l; i++) {
            v = obj[i];
            if (traditional || rbracket.test(prefix)) {
                // Treat each array item as a scalar.
                add(prefix, v);
            } else {
                buildParams(prefix + '[' + (typeof v === 'object' ? i : '') + ']', v, traditional, add);
            }
        }
    } else if (!traditional && hAzzle.type(obj) === "object") {
        // Serialize object item.
        for (name in obj) {
            buildParams(prefix + '[' + name + ']', obj[name], traditional, add);
        }

    } else {
        // Serialize scalar item.
        add(prefix, obj);
    }
}

AjaxCore.getexpando = function () {
    return expando;
};


// Extend to the global hAzzle Object

hAzzle.ajax = function (options, fn) {
    return new AjaxCore.xmlhttp(options, fn);
};