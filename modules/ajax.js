/**! AJAX
 *
 * TODO!! A lot of work to do here!! This is working as it is, but need to be extended.
 *
 * Whislist:
 *
 *  - Promises
 *  - Longpolling
 */
;
(function ($) {

    // Ajax
    var win = window,
        doc = document,
        byTag = 'getElementsByTagName',
        xmlHttpRequest = 'XMLHttpRequest',
        crElm = 'createElement',
        own = 'hasOwnProperty',
        head = doc.head || doc[byTag]('head')[0],
        uniqid = 0,
        lastValue, // data stored by the most recent JSONP callback
        nav = navigator,
        isIE10 = $.indexOf(nav.userAgent, 'MSIE 10.0') !== -1,

        defaultHeaders = {
            contentType: "application/x-www-form-urlencoded; charset=UTF-8", // Force UTF-8
            requestedWith: xmlHttpRequest,
            accepts: {
                '*': "*/".concat("*"),
                'text': 'text/plain',
                'html': 'text/html',
                'xml': 'application/xml, text/xml',
                'json': 'application/json, text/javascript',
                'js': 'application/javascript, text/javascript'
            }
        };

    /**
     * Convert to query string
     *
     * @param {Object} obj
     *
     * @return {String}
     *
     * - Taken from jQuery and optimized it for speed
     *
     */

    function ctqs(o, trad) {

        var prefix, i,
            traditional = trad || false,
            s = [],
            enc = encodeURIComponent,
            add = function (key, value) {
                // If value is a function, invoke it and return its value
                value = ($.isFunction(value)) ? value() : (value === null ? '' : value);
                s[s.length] = enc(key) + '=' + enc(value);
            };
        // If an array was passed in, assume that it is an array of form elements.
        if ($.isArray(o))
            for (i = 0; o && i < o.length; i++) add(o[i].name, o[i].value);
        else {
            for (prefix in o) {
                buildParams(prefix, o[prefix], traditional, add, o);
            }
        }
        return s.join('&').replace(/%20/g, '+');
    }

    /**
     * Build params
     */

    function buildParams(prefix, obj, traditional, add, o) {
        var name, i, v, rbracket = /\[\]$/;

        if ($.isArray(obj)) {
            for (i = 0; obj && i < obj.length; i++) {
                v = obj[i];
                if (traditional || rbracket.test(prefix)) {
                    // Treat each array item as a scalar.
                    add(prefix, v);
                } else buildParams(prefix + '[' + ($.isObject(v) ? i : '') + ']', v, traditional, add);
            }
        } else if (obj && obj.toString() === '[object Object]') {
            // Serialize object item.
            for (name in obj) {
                if (o[own](prefix)) buildParams(prefix + '[' + name + ']', obj[name], traditional, add);
            }

        } else add(prefix, obj);
    }

    /**
     *  Url append
     *
     * @param {String} url
     * @param {String} query
     * @return {String}
     */

    function appendQuery(url, query) {
        return (url + '&' + query).replace(/[&?]+/, '?')
    }

    /**
     * General jsonP callback
     *
     * @param {String} url
     * @param {String} s
     *
     * @return {String}
     **/

    function generalCallback(data) {
        lastValue = data;
    }

    /**
     * jsonP
     *
     * @param {Object} o
     * @param {Function} fn
     * @param {String} url
     *
     * @return {Object}
     **/

    function handleJsonp(o, fn, url) {

        var reqId = uniqid++,
            cbkey = o.jsonp || 'callback'; // the 'callback' key

        o = o.jsonpCallback || 'hAzzel_' + $.now(); // the 'callback' value

        var cbreg = new RegExp('((^|\\?|&)' + cbkey + ')=([^&]+)'),
            match = url.match(cbreg),
            script = doc[crElm]('script'),
            loaded = 0;

        if (match) {
            if (match[3] === '?') url = url.replace(cbreg, '$1=' + o); // wildcard callback func name
            else o = match[3]; // provided callback func name
        } else url = appendQuery(url, cbkey + '=' + o); // no callback details, add 'em


        win[o] = generalCallback;

        script.type = 'text/javascript';
        script.src = url;
        script.async = true;


        $.isDefined(script.onreadystatechange) && !isIE10 && (script.event = "onclick", script.htmlFor = script.id = "_hAzzel_" + reqId);

        script.onload = script.onreadystatechange = function () {

            if (script.readyState && script.readyState !== 'complete' && script.readyState !== 'loaded' || loaded) {
                return false;
            }
            script.onload = script.onreadystatechange = null;
            if (script.onclick) script.onclick();
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
                lastValue = undefined;
                head.removeChild(script);
                loaded = 1;
            }
        };
    }

    // Extend the hAzzle object

    $.extend({

        ajaxSettings: {

            // Default type of request
            type: 'GET',
            // Callback that is executed before request
            beforeSend: $.noop(),
            // Callback that is executed if the request succeeds
            success: $.noop(),
            // Callback that is executed the the server drops error
            error: $.noop(),
            // Callback that is executed on request complete (both: error and success)
            complete: $.noop(),
            // Default timeout
            timeout: 0,
            // async
            async: true,

            contentType: "application/x-www-form-urlencoded; charset=UTF-8",

        },

        /**
         * Ajax method to create ajax request with XMLHTTPRequest
         *
         * @param {Object|Function} opt
         * @param {function|callback} fn
         * @return {Object}
         */

        ajax: function (opt, fn) {
          
		  var key, h, err;
		  
            opt = $.extend({}, opt || {});

            for (key in $.ajaxSettings) {

                if (opt[key] === undefined) {

                    opt[key] = $.ajaxSettings[key];

                }

            }
            fn = fn || function () {};

            var xhr,
                xDomainRequest = 'XDomainRequest',
                error = 'error',
                headers = opt.headers || {},
                type = (opt.type || 'GET').toLowerCase(),
                url = $.isString(opt) ? opt : opt.url; // URL or options with URL inside. 
				
            var dataType = (opt.dataType) ? opt.dataType.toLowerCase() : '',
                abortTimeout = null,
                processData = opt.processData || true, // Set to true as default
                data = (processData !== false && opt.data && !$.isString(opt.data)) ? ctqs(opt.data) : (opt.data || null),
                sendWait = false;

            // If no url, stop here and return.

            if (!url) return false;

            // If jsonp or GET, append the query string to end of URL

            if ((dataType === 'jsonp' || type.toLowerCase() === 'get') && data) url = appendQuery(url, data), data = null;

            // If jsonp, we stop it here 

            if (dataType === 'jsonp' && /(=)\?(?=&|$)|\?\?/.test(url)) return handleJsonp(opt, fn, url);

            if (opt.crossOrigin === true) {
                var _xhr = win.XMLHttpRequest ? new XMLHttpRequest() : null;
                if (_xhr && 'withCredentials' in _xhr) xhr = _xhr;
                else if (win.xDomainRequest) xhr = new xDomainRequest();
                else throw "Browser does not support cross-origin requests";
            } else {
                xhr = new XMLHttpRequest()
            }

            xhr.open(type, url, opt.async === false ? false : true);

            // Set headers

            headers.Accept = headers.Accept || defaultHeaders.accepts[type] || defaultHeaders.accepts['*'];

            if (!opt.crossOrigin && !headers.requestedWith) headers.requestedWith = defaultHeaders.requestedWith;

            if (opt.contentType || opt.data && dataType.toLowerCase() !== 'get') xhr.setRequestHeader('Content-Type', (opt.contentType || 'application/x-www-form-urlencoded'));

            // Set headers

            for (h in headers) {

                headers.hasOwnProperty(h) && 'setRequestHeader' in xhr && xhr.setRequestHeader(h, headers[h]);

            }
            // Set credentials

            if ($.isDefined(opt.withCredentials) && $.isDefined(xhr.withCredentials)) {
                xhr.withCredentials = !! opt.withCredentials;
            }

            if (opt.timeout > 0) {
                abortTimeout = setTimeout(function () {
                    xhr.abort(); // Or should we use self.abort() ??
                }, opt.timeout);
            }

            if (win[xDomainRequest] && xhr instanceof win.xDomainRequest) {

                xhr.onload = fn;
                xhr.onerror = err;
                xhr.onprogress = function () {};
                sendWait = true;

            } else {
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {

                        // Determine if successful

                        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                            var res;
                            if (xhr) {

                                // json

                                if ((dataType === 'json' || false) && (res = JSON.parse(xhr.responseText)) === null) res = xhr.responseText;

                                // xml

                                if (dataType === 'xml') {

                                    res = xhr.responseXML && xhr.responseXML.parseError && xhr.responseXML.parseError.errorCode && xhr.responseXML.parseError.reason ? null : xhr.responseXML;

                                } else {

                                    res = res || xhr.responseText;
                                }
                            }
                            if (!res && data) res = data;
                            if (opt.success) opt.success(res);
                        } else if (opt.error !== undefined) {

                            if (abortTimeout !== null) clearTimeout(abortTimeout);
                            opt.error(error, opt, xhr);
                        }
                    }
                };
            }

            // Before open

            if (opt.before) opt.before(xhr);

            if (sendWait) {
                setTimeout(function () {

                    xhr.send(data);
                }, 200);
            } else xhr.send(data);

            return xhr;
        }
    });



    $.each(["get", "post"], function (i, method) {

        $[method] = function (url, data, callback, type) {
            // shift arguments if data argument was omitted
            if ($.isFunction(data)) {
                type = type || callback;
                callback = data;
                data = undefined;
            }

            return $.ajax({
                url: url,
                type: method,
                dataType: type,
                data: data,
                success: callback
            });
        };
    });

})(hAzzle);