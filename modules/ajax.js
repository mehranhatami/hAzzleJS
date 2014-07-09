var win = window,
    doc = win.document,
    uniqid = 0,

    slice = Array.prototype.slice,

    expando = 'xmlhttp_' + hAzzle.now(),

    lastValue, // data stored by the most recent JSONP callback

    xhrSuccessStatus = {
        // file protocol always yields status code 0, assume 200
        0: 200,
        // Support: IE9
        // #1450: sometimes IE returns 1223 when it should be 204
        1223: 204
    },

    headerTypes = {
        'text/plain': 'html',
        'text/html': 'html',
        'application/xml': 'xml',
        'text/xml': 'xml',
        'application/json': 'json',
        'text/javascript': 'json',
        'application/json, text/javascript': 'json',
    },

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
        json: "application/json, text/javascript"
    },

    // ActiveXObject when available (IE), otherwise XMLHttpRequest. 

    xhr = function (options) {

        if (options.crossOrigin === true) {

            var xhr = win['XMLHttpRequest'] ? new XMLHttpRequest() : null;

            if (xhr && 'withCredentials' in xhr) {

                return xhr;
                // Mehran!! Fix this and use Cors
            } else if (win['XDomainRequest']) {

                return new XDomainRequest();

            } else {

                hAzzle.error('Browser does not support cross-origin requests');
            }

        } else if (win['XMLHttpRequest']) {

            return new XMLHttpRequest();
        }
    };



var AjaxCore = {

    version: '0.0.2',

    has: {

        // Mehran!  I added feature check for CORS here
        // You fix!!

        'api-cors': !!xhr && ("withCredentials" in xhr),
        'api-ajax': !!xhr
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

        contentType: "application/x-www-form-urlencoded; charset=UTF-8",

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

    then: function (ajaxHandleResponses, fail) {

        ajaxHandleResponses = ajaxHandleResponses || function () {};
        fail = fail || function () {};

        if (this._fulfilled) {

            this._responseArgs.resp = ajaxHandleResponses(this._responseArgs.resp);

        } else if (this._erred) {

            fail(this._responseArgs.resp, this._responseArgs.msg, this._responseArgs.t);

        } else {

            this._fulfillmentHandlers.push(ajaxHandleResponses);
            this._errorHandlers.push(fail);
        }
        return this;
    },
    always: function (fn) {

        if (this._fulfilled || this._erred) {

            fn(this._responseArgs.resp);

        } else {

            this._completeHandlers.push(fn);
        }

        return this;
    },

    // fail will execute when the request fails

    fail: function (fn) {

        if (this._erred) {

            fn(this._responseArgs.resp, this._responseArgs.msg, this._responseArgs.t);

        } else {

            this._errorHandlers.push(fn);
        }

        return this;
    },

    catch: function (fn) {
        return this.fail(fn);
    }
};

function handleReadyState(r, ajaxHandleResponses, error) {

    return function () {
        if (r._aborted) {
            return error(r.request);
        }
        if (r.request && r.request.readyState == 4) {
            r.request.onreadystatechange = hAzzle.noop;
            if (xhrSuccessStatus[r.request.status] || r.request.status) {
                ajaxHandleResponses(r.request);
            } else {
                error(r.request);
            }
        }
    };
}

function gC(data) {
    lastValue = data;
}


function urlappend(url, s) {
    return s && (url + (query.test(url) ? '&' : '?') + s);
}

function handleJsonp(options, fn, err, url) {
    var reqId = uniqid++,
        cbkey = options.jsonp || 'callback', // the 'callback' key
        cbval = options.jsonpCallback || AjaxCore.getexpando(reqId),
        cbreg = new RegExp('((^|\\?|&)' + cbkey + ')=([^&]+)'),
        match = url.match(cbreg),
        script = doc.createElement('script'),
        loaded = 0,
        isIE10 = navigator.userAgent.indexOf('MSIE 10.0') !== -1;

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

    if (typeof script.onreadystatechange !== 'undefined' && !isIE10) {
        script.event = 'onclick';
        script.htmlFor = script.id = '_xmlhttp_' + reqId;
    }

    script.onload = script.onreadystatechange = function () {

        if ((script.readyState && script.readyState !== 'complete' && script.readyState !== 'loaded') || loaded) {
            return false;
        }

        script.onload = script.onreadystatechange = null;
        script.onclick && script.onclick();

        // Call the user callback with the last value stored and clean up values and scripts.

        fn(lastValue);
        lastValue = undefined;
        doc.head.removeChild(script);
        loaded = 1;
    };

    // Add the script to the DOM head
    doc.head.appendChild(script);

    // Enable JSONP timeout
    return {
        abort: function () {
            script.onload = script.onreadystatechange = null;
            err({}, 'Request is aborted: timeout', {});
            lastValue = undefined;
            doc.head.removeChild(script);
            loaded = 1;
        }
    };
}

function getRequest(fn, err) {
    var o = this.options,
        method = (o.type || 'GET').toUpperCase(),
        headers = o.headers || {},
        url = typeof o === 'string' ? o : o.url,
        data = (o.processData !== false && o.data && typeof o.data !== 'string') ? AjaxCore.toQueryString(o.data) : (o.data || null),
        xhttp, sendWait = false;

    // if we're working on a GET request and we have data then we should append
    // query string to end of URL and not post data
    if ((o.dataType == 'jsonp' || method == 'GET') && data) {
        url = urlappend(url, data);
        data = null;
    }

    if (o.dataType == 'jsonp') return handleJsonp(o, fn, err, url);

    xhttp = (o.xhr && o.xhr(o)) || xhr(o);

    // Open the socket
    if (o.username) {
        xhttp.open(method, url, o.async === false ? false : true, o.username, o.password);
    } else {
        xhttp.open(method, url, o.async === false ? false : true);
    }

    // Set headers

    var i, isAFormData = hAzzle.isFunction(FormData) && (o.data instanceof FormData);

    // Set accept header

    headers.Accept = headers.Accept || accepts[o.dataType] || accepts['*'];


    if (!headers.contentType && !isAFormData) {

        headers.contentType = o.contentType;
    }

    // Check for headers option

    for (i in headers) {

        xhttp.setRequestHeader(i, headers[i]);
    }

    // setCredentials

    if (typeof o.withCredentials !== 'undefined' && typeof xhttp.withCredentials !== 'undefined') {

        xhttp.withCredentials = !!o.withCredentials;
    }


    if (win['XDomainRequest'] && xhttp instanceof win['XDomainRequest']) {
        xhttp.onload = fn;
        xhttp.onerror = err;
        // NOTE: see
        // http://social.msdn.microsoft.com/Forums/en-US/iewebdevelopment/thread/30ef3add-767c-4436-b8a9-f1ca19b4812e
        xhttp.onprogress = function () {};
        sendWait = true;
    } else {
        xhttp.onreadystatechange = handleReadyState(this, fn, err);
    }
    o.before && o.before(xhttp);
    if (sendWait) {
        setTimeout(function () {
            try {
                xhttp.send(data);
            } catch (e) {
                err(e);
            }
        }, 200);
    } else {
        try {
            xhttp.send(data);
        } catch (e) {
            err(e);
        }

    }
    return xhttp;
}

/**
 * Prepeare the AJAX request
 *
 * @param{Object} o
 * @param{Function} fn
 */

function init(o, fn) {

    var self = this,
        opt;

    if (typeof o === 'string') {

        this.url = o;

    } else {

        this.url = o.url;
    }

    /**
     * Create the final options object - clone
     * the default ajaxsettings, IF
     * the default options are not set
     */

    for (opt in AjaxCore.ajaxSettings) {
        if (!o.hasOwnProperty(opt)) {
            o[opt] = AjaxCore.ajaxSettings[opt];
        }
    }

    this._fulfilled = false;
    this._successHandler = hAzzle.noop;
    this._fulfillmentHandlers = [];
    this._errorHandlers = [];
    this._completeHandlers = [];
    this._erred = false;
    this._responseArgs = {};

    // set timeout
    // default: 1500

    self.timeout = setTimeout(function () {
        self.abort();
    }, o.timeout);

    // set up the handlers
    // default: hAzzle.noop

    this._successHandler = function () {
        o.success.apply(o, arguments);
    };
    this._errorHandlers.push(function () {
        o.error.apply(o, arguments);
    });
    this._completeHandlers.push(function () {
        o.complete.apply(o, arguments);
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

        var type = o.dataType || headerTypes[resp.getResponseHeader('Content-Type')],
            status = resp.status,
            statusText = resp.responseText;

        // if no content

        if (status === 204) {

            statusText = "nocontent";

            // if not modified

        } else if (status === 304) {

            statusText = "notmodified";
        }

        resp = (type !== 'jsonp') ? self.request : resp;

        if (resp) {

            // Parse text as JSON
            resp = type === 'json' ? hAzzle.parseJSON(statusText) :
                // Text to html
                type === 'html' ? statusText :
                // Parse text as xml
                type === 'xml' ? resp = hAzzle.parseXML(resp.responseXML) : '';
        }

        self._responseArgs.resp = resp;
        self._fulfilled = true;
        fn(resp);
        self._successHandler(resp);
        while (self._fulfillmentHandlers.length > 0) {
            resp = self._fulfillmentHandlers.shift()(resp);
        }

        complete(resp);
    }

    function error(resp, msg, t) {
        resp = self.request;
        self._responseArgs.resp = resp;
        self._responseArgs.msg = msg;
        self._responseArgs.t = t;
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
        optCb = function (options) {
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

    if (t === 'TEXTAREA' || t === 'KEYGEN') {

        callback(n, normalize(el.value));
    }

    if (t === 'SELECT') {

        if (el.type.toLowerCase() === 'select-one') {

            optCb(el.selectedIndex >= 0 ? el.options[el.selectedIndex] : null);

        } else {

            for (; i < len; i++) {

                if (el.options[a].selected) {

                    optCb(el.options[a]);
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