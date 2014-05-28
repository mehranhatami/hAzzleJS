/**
 *   IMPORTANT
 *
 * - Add queing. And option to stop requests that take to long time. This has to
 *   be in AjaxSettings / options. Say after 20 ms, cancel if no success
 *
 *  - Option to send BLOB files
 *
 * - Full Async support
 *
 * - Multiple requests at the same time. Each request should be queued, and executed one by one.
 *   For the queue it should be options like stop, cancel, pause and resume.
 *
 * - Pause an Ajax request
 **************************/

var win = this,
  doc = win.document,

  ajaxLocation,

  rbracket = /\[\]$/,
  r20 = /%20/g,

  submitterTypes = /reset|button|image|file/i,
  checkbox = /checkbox/i,
  radio = /radio/i,
  submittable = /input|select|textarea|keygen/i,

  twoHundo = /^(20\d|1223)$/,
  readyState = 'readyState',
  contentType = 'Content-Type',
  requestedWith = 'X-Requested-With',
  head = doc.getElementsByTagName('head')[0],
  uniqid = 0,
  callbackPrefix = 'hAzzle_' + hAzzle.now,
  lastValue, // data stored by the most recent JSONP callback

  xhrSuccessStatus = {
    // file protocol always yields status code 0, assume 200
    0: 200,
    // Support: IE9
    // #1450: sometimes IE returns 1223 when it should be 204
    1223: 204
  },

  defaultHeaders = {
    'contentType': 'application/x-www-form-urlencoded; charset=UTF-8',
    'requestedWith': 'xmlHttpRequest',
    'accept': {

      // Avoid comment-prolog char sequence

      '*': '*/'.concat('*'),
      'xml': 'application/xml, text/xml',
      'html': 'text/html',
      'text': 'text/plain',
      'json': 'application/json, text/javascript',
      'js': 'application/javascript, text/javascript'
    }
  },


  globalSetupOptions = {
    dataFilter: function (data) {
      return data;
    }
  },

  // standard query string style serialization
  serializeQueryString = function () {
    return hAzzle.param(hAzzle.serializeArray.apply(null, arguments));
  };



// IE may throw an exception when accessing
// a field from window.location if document.domain has been set

try {
  ajaxLocation = location.href;
} catch (e) {
  // Use the href attribute of an A element
  // since IE will modify it given document.location
  ajaxLocation = document.createElement('a');
  ajaxLocation.href = '';
  ajaxLocation = ajaxLocation.href;
}

function setType(header) {

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
}

// Ajax main function

function ajax() {

  this.init.apply(this, arguments);
}

// Ajax prototype

ajax.prototype = {

  init: function (options, fn) {

    // Options are already set at this stage

    var self = this;

    self.url = typeof options === 'string' ? options : options.url;

    self.options = options;

    self.timeout = null;

    // whether request has been fulfilled for purpose
    // of tracking the Promises
    self._fulfilled = false;
    // success handlers
    self._successHandler = function () {};
    self._fulfillmentHandlers = [];
    // error handlers
    self._errorHandlers = [];
    // complete (both success and fail) handlers
    self._completeHandlers = [];
    self._erred = false;
    self._responseArgs = {};

    fn = fn || function () {};

    if (options.timeout) {
      this.timeout = setTimeout(function () {
        self.abort();
      }, options.timeout);
    }

    if (options.success) {
      this._successHandler = function () {
        options.success.apply(options, arguments);
      };
    }

    if (options.error) {
      this._errorHandlers.push(function () {
        options.error.apply(options, arguments);
      });
    }

    if (options.complete) {
      this._completeHandlers.push(function () {
        options.complete.apply(options, arguments);
      });
    }

    function complete(resp) {

      if (options.timeout) {

        clearTimeout(self.timeout);
      }

      self.timeout = null;
      while (self._completeHandlers.length > 0) {
        self._completeHandlers.shift()(resp);
      }
    }

    function success(resp) {

      var status = xhrSuccessStatus[resp.status] || resp.status,
        statusText;

      // if no content

      if (status === 204) {

        statusText = 'nocontent';

        // if not modified

      } else if (status === 304) {

        statusText = 'notmodified';

        // If we have data, let's convert it
      } else {

        var type = options.dataType || setType(resp.getResponseHeader('Content-Type'));

        resp = (type !== 'jsonp') ? self.request : resp;

        // use global data filter on response text

        var filteredResponse = globalSetupOptions.dataFilter(resp.responseText, type),
          r = filteredResponse;

        // Get the response

        resp.responseText = r;

        if (r) {

          // JSON

          if (type === 'json') {

            resp = hAzzle.parseJSON(resp);

            // HTML

          } else if (type === 'html') {

            resp = r;

            // XML

          } else if (type === 'xml') {

            resp = hAzzle.parseXML(resp.responseXML);

            // If none of the above, return 'statusText'

          } else {

            resp = statusText;
          }
        }
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

    this.request = this.getRequest.call(this, success, error);
  },

  getRequest: function (fn, err) {
    var o = this.options,
      method = (o.type || 'GET').toUpperCase(),
      url = this.url,
      xhr,
      headers = o.headers || {},

      // convert non-string objects to query-string form unless o['processData'] is false

      data = (o.processData !== false && o.data && typeof o.data !== 'string') ? hAzzle.param(o.data) : (o.data || null),
      h, H_xhr, sendWait = false;

    // if we're working on a GET request and we have data then we should append
    // query string to end of URL and not post data

    if ((o.dataType === 'jsonp' || method === 'GET') && data) {
      url = urlappend(url, data);
      data = null;
    }

    if (o.dataType === 'jsonp') {

      return handleJsonp(o, fn, err, url);
    }

    if (o.crossOrigin === true) {

      xhr = win.xmlHttpRequest ? new XMLHttpRequest() : null;

      if (xhr && 'withCredentials' in xhr) {

        H_xhr = xhr;

      } else if (win.xDomainRequest) {

        H_xhr = new win.XDomainRequest();

      } else {

        throw new Error('Browser does not support cross-origin requests');

      }
    } else {

      try {

        H_xhr = new XMLHttpRequest();

      } catch (e) {}
    }

    H_xhr.open(method, url, o.async === false ? false : true);

    // Set headers

    headers.Accept = headers.Accept || defaultHeaders.accept[o.type] || defaultHeaders.accept['*'];

    var iAFD = FormData && (o.data instanceof FormData);

    // Breaks cross-origin requests with legacy browsers

    if (!o.crossOrigin && !headers[requestedWith]) {

      headers[requestedWith] = defaultHeaders.requestedWith;
    }

    if (!headers[contentType] && !iAFD) {

      headers[contentType] = o.contentType || defaultHeaders.contentType;
    }

    for (h in headers) {

      if (headers.hasOwnProperty(h) && 'setRequestHeader' in H_xhr) {

        H_xhr.setRequestHeader(h, headers[h]);
      }
    }
    setCredentials(H_xhr, o);

    if (win.xDomainRequest && H_xhr instanceof win.xDomainRequest) {
      H_xhr.onload = fn;
      H_xhr.onerror = err;
      H_xhr.onprogress = function () {};
      sendWait = true;

    } else {

      H_xhr.onreadystatechange = handleReadyState(this, fn, err);
    }

    if (o.beforeSend) {

      o.beforeSend(H_xhr);
    }

    if (sendWait) {
      setTimeout(function () {
        H_xhr.send(data);
      }, 200);

    } else {

      H_xhr.send(data);
    }

    return H_xhr;
  },

  abort: function () {

    this._aborted = true;
    this.request.abort();
  },

  retry: function () {

    this.init.call(this, this.options, this.fn);
  },

  /**
   * `then` will execute upon successful requests
   */

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

  /**
   * `always` will execute whether the request succeeds or fails
   */

  always: function (fn) {

    if (this._fulfilled || this._erred) {

      fn(this._responseArgs.resp);

    } else {

      this._completeHandlers.push(fn);
    }
    return this;
  },

  /**
   * `fail` will execute when the request fails
   */

  fail: function (fn) {

    if (this._erred) {

      fn(this._responseArgs.resp, this._responseArgs.msg, this._responseArgs.t);

    } else {

      this._errorHandlers.push(fn);
    }
    return this;
  }

};


hAzzle.extend({

  ajaxSettings: {
    url: ajaxLocation,
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: hAzzle.noop(),
    // Callback that is executed if the request succeeds
    success: hAzzle.noop(),
    // Callback that is executed the the server drops error
    error: hAzzle.noop(),
    // Callback that is executed on request complete (both: error and success)
    complete: hAzzle.noop(),
    // Default timeout
    timeout: 0,
    // async
    async: true,
    contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
  },

  serializeArray: function () {

    var arr = [];

    eachFormElement.apply(function (name, value) {
      arr.push({
        name: name,
        value: value
      });
    }, arguments);

    return arr;
  },

  serialize: function () {

    if (arguments.length === 0) {
      return '';
    }

    var opt, fn, args = Array.prototype.slice.call(arguments, 0);

    opt = args.pop();
    //TODO Kenny: check the new code does the exact same thing
    //opt && opt.nodeType && args.push(opt) && (opt = null);
    //opt && (opt = opt.dataType);
    if (opt) {
      if (opt.nodeType) {
        args.push(opt);
        opt = null;
      } else {
        opt = opt.dataType;
      }
    }

    if (opt === 'map') {

      fn = serializeHash;

    } else if (opt === 'array') {

      fn = hAzzle.serializeArray;

    } else {

      fn = serializeQueryString;
    }

    return fn.apply(null, args);
  },

  // Serialize an array of form elements or a set of
  // key/values into a query string
  param: function (o, trad) {
    var prefix, i, traditional = trad || false,
      s = [],
      enc = encodeURIComponent,
      add = function (key, value) {
        // If value is a function, invoke it and return its value
        value = ('function' === typeof value) ? value() : (value === null ? '' : value);
        s[s.length] = enc(key) + '=' + enc(value);
      };

    // If an array was passed in, assume that it is an array of form elements.

    if (hAzzle.isArray(o)) {

      for (i = 0; o && i < o.length; i++) {
        // Serialize the form elements		
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
  },



  getcallbackPrefix: function () {
    return callbackPrefix;
  },

  ajaxSetup: function (options) {
    options = options || {};
    for (var k in options) {
      globalSetupOptions[k] = options[k];
    }
  },

  /**
   * Ajax main function
   *
   * We are setting up the options first before
   * we call the 'Ajax prototype'.
   *
   * Ajax is it's own prototype so we can use
   * promises
   *
   */

  ajax: function (options, callback) {

    // Force options to be an object

    options = options || {};

    // Copy over and use the deault Ajax settings
    // if no settings defined by user

    for (var key in hAzzle.ajaxSettings) {
      if (typeof options[key] === 'undefined') {
        options[key] = hAzzle.ajaxSettings[key];
      }
    }

    // New Ajax	

    return new ajax(options, callback);
  }

}, hAzzle);



function setCredentials(H_xhr, o) {

  if (typeof o.withCredentials !== 'undefined' && typeof H_xhr.withCredentials !== 'undefined') {
    H_xhr.withCredentials = !! o.withCredentials;
  }
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
    cbval = o.jsonpCallback || hAzzle.getcallbackPrefix(reqId),
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

    script.htmlFor = script.id = '_hAzzle_' + reqId;
  }

  script.onload = script.onreadystatechange = function () {
    if ((script.readyState && script.readyState !== 'complete' && script[readyState] !== 'loaded') || loaded) {
      return false;
    }
    script.onload = script.onreadystatechange = null;

    if (script.onclick) {

      script.onclick();

    }

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



function handleReadyState(r, success, error) {

  return function () {

    if (r._aborted) {

      return error(r.request);
    }

    if (r.request && r.request[readyState] === 4) {

      r.request.onreadystatechange = hAzzle.noop;

      if (twoHundo.test(r.request.status)) {

        success(r.request);

      } else {

        error(r.request);
      }
    }
  };
}


function buildParams(prefix, obj, traditional, add) {
  var name;

  if (hAzzle.isArray(obj)) {
    // Serialize array item.
    hAzzle.each(obj, function (i, v) {
      if (traditional || rbracket.test(prefix)) {
        // Treat each array item as a scalar.
        add(prefix, v);

      } else {
        // Item is non-scalar (array or object), encode its numeric index.
        buildParams(prefix + '[' + (typeof v === 'object' ? i : '') + ']', v, traditional, add);
      }
    });

  } else if (!traditional && hAzzle.type(obj) === 'object') {
    // Serialize object item.
    for (name in obj) {
      buildParams(prefix + '[' + name + ']', obj[name], traditional, add);
    }

  } else {
    // Serialize scalar item.
    add(prefix, obj);
  }
}



function serial(el, cb) {
  var n = el.name,
    t = el.tagName.toLowerCase(),
    optCb = function (o) {

      if (o && !o.disabled) {
        cb(n, normalize(o.attributes.value && o.attributes.value.specified ? o.value : o.text));
      }
    },
    ch, ra, val, i;

  // don't serialize elements that are disabled or without a name
  if (el.disabled || !n) {

    return;
  }

  if (t === 'input') {
    if (!submitterTypes.test(el.type)) {
      ch = checkbox.test(el.type);
      ra = radio.test(el.type);
      val = el.value;

      //TODO Kenny: check if it does the exact same thing
      //(!(ch || ra) || el.checked) && cb(n, normalize(ch && val === '' ? 'on' : val));
      if (!(ch || ra) || el.checked) {
        cb(n, normalize(ch && val === '' ? 'on' : val));
      }
    }
  } else if (t === 'textarea') {

    cb(n, normalize(el.value));

  } else if (t === 'select') {

    if (el.type.toLowerCase() === 'select-one') {

      optCb(el.selectedIndex >= 0 ? el.options[el.selectedIndex] : null);

    } else {

      for (i = 0; el.length && i < el.length; i++) {

        if (el.options[i].selected) {

          optCb(el.options[i]);
        }
      }
    }
  }
}

function eachFormElement() {
  var cb = this,
    len = arguments.length,
    e, i, serializeSubtags = function (e, tags) {
      var i, j, fa;
      for (i = 0; i < tags.length; i++) {
        fa = e.getElementsByTagName(tags[i]);
        for (j = 0; j < fa.length; j++) {

          serial(fa[j], cb);
        }
      }
    };

  for (i = 0; i < len; i++) {
    e = arguments[i];
    if (submittable.test(e.tagName)) {

      serial(e, cb);
    }

    serializeSubtags(e, ['input', 'select', 'textarea']);
  }
}


// { 'name': 'value', ... } style serialization
function serializeHash() {
  var hash = {};
  eachFormElement.apply(function (name, value) {
    if (name in hash) {

      if (hash[name] && !hAzzle.isArray(hash[name])) {

        hash[name] = [hash[name]];
      }

      hash[name].push(value);

    } else {

      hash[name] = value;
    }
  }, arguments);
  return hash;
}



// normalize newline variants according to spec -> CRLF
function normalize(s) {
  return s ? s.replace(/\r?\n/g, '\r\n') : '';
}