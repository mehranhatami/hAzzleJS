var KF = hAzzle.KF,
    win = window,
    doc = win.document,

slice = Array.prototype.slice,
    isSuccess,
    state,

    readyState = 'readyState',
    contentType = 'Content-Type',

    head = document.getElementsByTagName('head')[0],
    uniqid = 0,
    callbackPrefix = 'KF_' + hAzzle.now(),
    lastValue, // data stored by the most recent JSONP callback
    xmlHttpRequest = 'XMLHttpRequest',
    xDomainRequest = 'XDomainRequest',
    noop = function () {},

    xhrSuccessStatus = {
        // file protocol always yields status code 0, assume 200
        0: 200,
        // Support: IE9
        // #1450: sometimes IE returns 1223 when it should be 204
        1223: 204
    },

    // Document location

    ajaxLocParts,
    ajaxLocation = location.href,

    allTypes = "*/".concat("*"),

    // Usefull regEx
    
	r20 = /%20/g,
    normalize = /\r?\n/g,
    submittable = /^(?:input|select|textarea|keygen)/i,
    submitterTypes = /^(?:submit|button|image|reset|file)$/i,
    checkbox = /^checkbox/i,
    radio = /^radio/i,

    isArray = hAzzle.isArray,

    accepts = {
        "*": allTypes,
        text: "text/plain",
        html: "text/html",
        xml: "application/xml, text/xml",
        json: "application/json, text/javascript"
    },

    defaultHeaders = {

        'contentType': 'application/x-www-form-urlencoded; charset=UTF-8',
        'requestedWith': 'XMLHttpRequest',
    },

    xhr = function (options) {

        if (options.crossOrigin === true) {

            var xhr = win.xmlHttpRequest ? new XMLHttpRequest() : null;

            if (xhr && 'withCredentials' in xhr) {

                return xhr;
// Mehran!! Fix this and use Cors
            } else if (win['XDomainRequest']) {

                return new XDomainRequest();

            } else {

                hAzzle.error('Browser does not support cross-origin requests');
            }

        } else if (window.xmlHttpRequest) {

            return new XMLHttpRequest();
        }
    };

hAzzle.extend({

    version: '0.0.2',

    has: {

        'api-cors': !!xhr && ("withCredentials" in xhr),
        //	'api-ajax': xhrSupported = !!xhrSupported

    },

    xhr: function () {

        if (KF.has['api-ajax']) {

            return xhrSupported;
        } else {
            hAzzle.error("xmlhttp not supported!!");
        }

    },

    // Ajax	

    xmlhttp: function (o, fn) {
        this.o = o;
        this.fn = fn;

        // prepeare for xmlhttp requests

        init.apply(this, arguments);

        /**
         * Default AJAX settings
         */

    },
    ajaxSettings: {
        url: ajaxLocation,
        type: "GET",
        async: true,
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        /*   accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript" 
		},*/
        timeout: 1500,
        success: hAzzle.noop,
        error: hAzzle.noop,
        complete: hAzzle.noop
    }

}, KF);

/* =========================== AJAX PROTOTYPE CHAIN ========================== */

KF.xmlhttp.prototype = {

    abort: function () {

        this._aborted = true;
        this.request.abort();
    },

    retry: function () {

        init.call(this, this.o, this.fn);
    },
    then: function (success, fail) {

        success = success || function () {};
        fail = fail || function () {};

        if (this._fulfilled) {

            this._responseArgs.resp = success(this._responseArgs.resp);

        } else if (this._erred) {

            fail(this._responseArgs.resp, this._responseArgs.msg, this._responseArgs.t);

        } else {

            this._fulfillmentHandlers.push(success);
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

function handleReadyState(r, success, error) {

    return function () {

        if (r._aborted) {

            return error(r.request);
        }

        state = r.request.readyState;

        // Called once

        if (state === 2) {

            return;
        }

        // State is "done" now

        state = 2;

        // Set readyState

        r.request.readyState = status > 0 ? 4 : 0;

        // Determine if successful
        isSuccess = r.request.status >= 200 && r.request.status < 300 || r.request.status === 304;

        // We now have readyState 3 or 4. readyState 2 are left behind

        if (isSuccess) {
            if (r.request && r.request.readyState == 4) {
                r.request.onreadystatechange = hAzzle.noop;
                if (xhrSuccessStatus[r.request.status] || r.request.status) {
                    success(r.request);
                } else {
                    error(r.request);
                }
            }
        }
    };
}

function generalCallback(data) {
    lastValue = data;
}

function urlappend(url, s) {
    return url + (/\?/.test(url) ? '&' : '?') + s;
}

function handleJsonp(o, fn, err, url) {
    var reqId = uniqid++,
        cbkey = o.jsonp || 'callback', // the 'callback' key
        cbval = o.jsonpCallback || KF.getcallbackPrefix(reqId),
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

    win[cbval] = generalCallback;

    script.type = 'text/javascript';
    script.src = url;
    script.async = true;
    if (typeof script.onreadystatechange !== 'undefined' && !isIE10) {
        // need this for IE due to out-of-order onreadystatechange(), binding script
        // execution to an event listener gives us control over when the script
        // is executed. See http://jaubourg.net/2010/07/loading-script-as-onclick-handler-of.html
        script.htmlFor = script.id = '_KF_' + reqId;
    }

    script.onload = script.onreadystatechange = function () {
        if ((script[readyState] && script[readyState] !== 'complete' && script[readyState] !== 'loaded') || loaded) {
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
        abort: function () {
            script.onload = script.onreadystatechange = null;
            err({}, 'Request is aborted: timeout', {});
            lastValue = undefined;
            head.removeChild(script);
            loaded = 1;
        }
    };
}

function getRequest(fn, err) {
    var o = this.o,
        method = (o.type || 'GET').toUpperCase(),
        headers = o.headers || {},
        url = typeof o === 'string' ? o : o.url,
        data = (o.processData !== false && o.data && typeof o.data !== 'string') ? KF.toQueryString(o.data) : (o.data || null),
        http, sendWait = false;

    // if we're working on a GET request and we have data then we should append
    // query string to end of URL and not post data
    if ((o.dataType == 'jsonp' || method == 'GET') && data) {
        url = urlappend(url, data);
        data = null;
    }

    if (o.dataType == 'jsonp') return handleJsonp(o, fn, err, url);

    // get the xhr from the factory if passed
    // if the factory returns null, fall-back to ours
    http = (o.xhr && o.xhr(o)) || xhr(o);

    http.open(method, url, o.async === false ? false : true);


    // Set headers

    var i, isAFormData = hAzzle.isFunction(FormData) && (o.data instanceof FormData);

    // Set accept header

    headers.Accept = headers.Accept || accepts[o.dataType] || accepts['*'];

    if (!headers[contentType] && !isAFormData) {

        headers[contentType] = o.contentType || defaultHeaders.contentType;
    }

    // Check for headers option

    for (i in headers) {

        http.setRequestHeader(i, headers[i]);
    }

    // setCredentials

    if (typeof o.withCredentials !== 'undefined' && typeof http.withCredentials !== 'undefined') {

        http.withCredentials = !!o.withCredentials;
    }


    if (win[xDomainRequest] && http instanceof win[xDomainRequest]) {
        http.onload = fn;
        http.onerror = err;
        // NOTE: see
        // http://social.msdn.microsoft.com/Forums/en-US/iewebdevelopment/thread/30ef3add-767c-4436-b8a9-f1ca19b4812e
        http.onprogress = function () {};
        sendWait = true;
    } else {
        http.onreadystatechange = handleReadyState(this, fn, err);
    }
    o.before && o.before(http);
    if (sendWait) {
        setTimeout(function () {
            http.send(data);
        }, 200);
    } else {
        http.send(data);
    }
    return http;
}

function setType(header) {
    // json, javascript, text/plain, text/html, xml
    if (header.match('json')) return 'json';
    if (header.match('javascript')) return 'js';
    if (header.match('text')) return 'html';
    if (header.match('xml')) return 'xml';
}

/**
 * Prepeare the AJAX request
 *
 * @param{Object} o
 * @param{Function} fn
 */

function init(o, fn) {

    var self = this;

    if (typeof o === 'string') {

        self.url = o;

    } else {

        self.url = o.url;
    }

    /**
     * Create the final options object, clone
     * the default settings to the o Object, IF
     * the default options are not set
     */

    o = ajaxExtend(KF.ajaxSettings, o);

    self._fulfilled = false;
    self._successHandler = hAzzle.noop;
    self._fulfillmentHandlers = [];
    self._errorHandlers = [];
    self._completeHandlers = [];
    self._erred = false;
    self._responseArgs = {};

    // set timeout
    // default: 1500

    self.timeout = setTimeout(function () {
        self.abort();
    }, o.timeout);

    // set up the handlers
    // default: hAzzle.noop

    self._successHandler = function () {
        o.success.apply(o, arguments);
    };
    self._errorHandlers.push(function () {
        o.error.apply(o, arguments);
    });
    self._completeHandlers.push(function () {
        o.complete.apply(o, arguments);
    });

    //
    fn = fn || hAzzle.noop;

    // Complete
    // Can we use rAF for this?

    function complete(resp) {

        // Clear the timeout

        clearTimeout(self.timeout);
        self.timeout = null;
        while (self._completeHandlers.length > 0) {

            self._completeHandlers.shift()(resp);
        }
    }

    function success(resp) {

        var type = o.dataType || setType(resp.getResponseHeader('Content-Type')),
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

        if (statusText) {

            // Parse text as JSON
            resp = type === 'json' ? hAzzle.parseJSON(statusText) :
                // Text to html
                type === 'html' ? statusText :
                // Parse text as xml
                type === 'xml' ? resp = hAzzle.parseXML(resp) : '';
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

    this.request = getRequest.call(this, success, error);
}



// normalize newline variants according to spec -> CRLF
function normalize(s) {
    return s ? s.replace(normalize, '\r\n') : '';
}

function serial(el, cb) {
    var n = el.name,
        t = el.tagName.toLowerCase(),
        optCb = function (o) {
            // IE gives value="" even where there is no value attribute
            // 'specified' ref: http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-862529273
            if (o && !o.disabled) {
                cb(n, normalize(o.attributes.value && o.attributes.value.specified ? o.value : o.text));
            }
        },
        ch, ra, val, i;

    // don't serialize elements that are disabled or without a name
    if (el.disabled || !n) return;

    switch (t) {
    case 'input':
        if (!submitterTypes.test(el.type)) {
            ch = checkbox.test(el.type);
            ra = radio.test(el.type);
            val = el.value;

            (!(ch || ra) || el.checked) && cb(n, normalize(ch && val === '' ? 'on' : val));
        }
        break;
    case 'textarea':
        cb(n, normalize(el.value));
        break;
    case 'select':
        if (el.type.toLowerCase() === 'select-one') {
            optCb(el.selectedIndex >= 0 ? el.options[el.selectedIndex] : null);
        } else {
            for (i = 0; el.length && i < el.length; i++) {
                el.options[i].selected && optCb(el.options[i]);
            }
        }
        break;
    }
}

function eachFormElement() {
    var cb = this,
        e, i, serializeSubtags = function (e, tags) {

            var i=0, j=0, l = tags.length, len, fa;

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
		
        serializeSubtags(e, ['input', 'select', 'textarea']);
    }
}

// standard query string style serialization
function serializeQueryString() {
    return KF.toQueryString(KF.serializeArray.apply(null, arguments));
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

// [ { name: 'name', value: 'value' }, ... ] style serialization
KF.serializeArray = function () {
    var arr = [];
    eachFormElement.apply(function (name, value) {
        arr.push({
            name: name,
            value: value
        });
    }, arguments);
    return arr;
};

KF.serialize = function () {
    if (arguments.length === 0) return '';
    var opt, fn, args = slice.call(arguments, 0);

    opt = args.pop();
    opt && opt.nodeType && args.push(opt) && (opt = null);
    opt && (opt = opt.type);

    if (opt == 'map') {
        fn = serializeHash;
    } else if (opt == 'array') fn = KF.serializeArray;
    else fn = serializeQueryString;

    return fn.apply(null, args);
};
// Serialize an array of form elements or a set of
hAzzle.param = KF.toQueryString = function (o, trad) {
    var prefix, i = 0, l, traditional = trad || false,
        s = [],
        enc = encodeURIComponent,
        add = function (key, value) {
            // If value is a function, invoke it and return its value
			value = hAzzle.isFunction( value ) ? value() : ( value === null ? '' : value );
            s[s.length] = enc(key) + '=' + enc(value);
        };
        // If an array was passed in, assume that it is an array of form elements.
    if (isArray(o) ) {
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
    var name, i=0, l, v, rbracket = /\[\]$/;

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
    } else if ( !traditional && hAzzle.type( obj ) === "object"  ) {
        // Serialize object item.
        for (name in obj) {
            buildParams(prefix + '[' + name + ']', obj[name], traditional, add);
        }

    } else {
        // Serialize scalar item.
        add(prefix, obj);
    }
}

function ajaxExtend(target, src) {
    var key;

    for (key in src) {
        if (src[key] !== undefined) {
            target[key] = src[key];
        }
    }

    return target;
}


KF.getcallbackPrefix = function () {
    return callbackPrefix;
};


// Extend to the global hAzzle Object

hAzzle.ajax = function (o, fn) {
    return new KF.xmlhttp(o, fn);
};




