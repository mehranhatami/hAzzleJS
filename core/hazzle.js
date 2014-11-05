/*!
 * hAzzle.js
 * Copyright (c) 2014 Kenny Flashlight
 * Version: 1.0.0d Release Candidate
 * Released under the MIT License.
 *
 * Date: 2014-11-05
 */
(function (window, undefined) {

  var
  // Quick-lookup for hAzzle(id)

    idOnly = /^#([\w\-]*)$/,

    // Holder for all modules

    version = '1.0.0a-rc',

    codename = 'new-age',

    // Throws an error if `condition` is `true`.

    err = function (condition, code, message) {
      if (condition) {
        var e = new Error('[hAzzle-' + code + '] ' + message);
        e.code = code;
        throw e;
      }
    },

    validTypes = function (elem) {
      return elem && (elem.ELEMENT_NODE || elem.DOCUMENT_NODE);
    },

    // Define a local copy of hAzzle
    // NOTE! Everything need to be returned as an array
    // so important to wrap [] around the 'sel' to avoid
    // errors

    hAzzle = function (sel, ctx) {

      // hAzzle(), hAzzle(null), hAzzle(undefined), hAzzle(false)
      if (!sel) {
        return;
      }
      // Allow instantiation without the 'new' keyword
      if (!(this instanceof hAzzle)) {
        return new hAzzle(sel, ctx);
      }

      if (sel instanceof hAzzle) {
        return sel;
      }

      // Include required module

      var m, els, _util = hAzzle.require('Util'),
        // Document ready
        _ready = hAzzle.require('Ready');

      // If a function is given, call it when the DOM is ready

      if (typeof sel === 'function') {

        //REVIEW NEEDED: how it works? I changed it from "installed.Ready" to "hAzzle.installed.Ready"
        //because it doesn't have direct access to the "installed" object

        if (hAzzle.installed.Ready) {
          _ready.ready(sel);
        } else {
          err(true, 6, 'ready.js module not installed');
        }
      }

      if (typeof sel === 'string') {

        // Quick look-up for hAzzle(#id)

        if ((m = idOnly.exec(sel)) && !ctx) {
          els = [document.getElementById(m[1])];
        }

        if (els === null || els === undefined) {

          // The 'find' method need to have a boolean value set to 'true', to 
          // work as expected. Else it will behave like the global .find method

          els = this.find(sel, ctx, true);
        }
        // hAzzle([dom]) 
      } else if (sel instanceof Array) {
        els = _util.unique(_util.filter(sel, validTypes));
        // hAzzle(dom)
      } else if (this.isNodeList(sel)) {
        els = _util.filter(_util.makeArray(sel), validTypes);
        // hAzzle(dom)
      } else if (sel.nodeType) {
        // If it's a html fragment, create nodes from it
        if (sel.nodeType === 11) {
          // This children? Are they an array or not?
          els = sel.children;
        } else {
          els = [sel];
        }
        // window     
      } else if (sel === window) {
        els = [sel];
      } else {
        els = [];
      }

      // Create a new hAzzle collection from the nodes found
      // NOTE!! If undefined, set length to 0, and
      // elements to an empty array [] to avoid hAzzle
      // throwing errors

      if (els === undefined) {
        this.length = 0;
        this.elements = [];
      } else {
        this.elements = els;
        this.length = els.length;
      }
      return this;
    };

  function exposeModuleLoader(global, hAzzle) {
    'use strict';

    var
      isArray = Array.isArray,
      toString = Object.prototype.toString,

      doc = global.document,
      currentScript = document.currentScript,

      emptyArray = [],

      //private stuff
      options = {},
      files = {},
      scriptsTiming = {
        timeStamp: {},
        scripts: {}
      },
      baseUrl = '',
      baseGlobal,

      waitingList = {},
      urlCache = {},
      loadedModules = {},
      moduleDependencies = {},
      modules = {},
      installed = {},
      failedList = [],

      isObject = function (value) {
        // avoid a V8 bug in Chrome 19-20
        // https://code.google.com/p/v8/issues/detail?id=2291
        var type = typeof value;
        return type === 'function' || (value && type === 'object') || false;
      },
      isFunction = function (val) {
        return toString.call(val) === '[object Function]';
      },

      getFileInfo = function (url) {

        var info = files[url],
          ind;

        if (!isObject(info)) {

          info = {};

          ind = url.indexOf('#');
          if (-1 < ind) {
            info.hash = url.substring(ind);
            url = url.substring(0, ind);
          }

          ind = url.indexOf('?');
          if (-1 < ind) {
            info.search = url.substring(ind);
            url = url.substring(0, ind);
          }

          info.fileName = url.substring(url.lastIndexOf('/') + 1);
          ind = info.fileName.lastIndexOf('.');
          if (-1 < ind) {
            info.ext = info.fileName.substring(ind);
            info.fileName = info.fileName.substring(0, ind);
          }
          info.filePath = url.substring(0, url.lastIndexOf('/') + 1);
          files[url] = info;
        }
        return info;
      },

      getUrl = function (moduleName) {

        // if already cached, return

        if (typeof urlCache[moduleName] === 'string') {
          return urlCache[moduleName];
        }

        var url = baseUrl,
          urlArgs = '';

        if (typeof options.urlArgs === 'string') {
          urlArgs = '?' + options.urlArgs;
        }

        if (isFunction(urlArgs)) {
          urlArgs = '?' + options.urlArgs();
        }

        // Overwrite already defined url if not undefined

        if (options.baseUrl !== undefined) {
          url = options.baseUrl;
        }

        if (isObject(options.paths)) {
          if (typeof options.paths[moduleName] === 'string') {
            moduleName = options.paths[moduleName];
          }
        }

        if (url.substring(url.length - 1) !== '/' &&
          moduleName.substring(0, 1) !== '/') {
          url += '/';
        }

        url += moduleName + '.js' + urlArgs;

        // Cache the URL

        urlCache[moduleName] = url;

        return url;
      };

    if (currentScript) {
      baseUrl = currentScript.getAttribute('base') || getFileInfo(currentScript.src).filePath;
      baseGlobal = currentScript.getAttribute('global');
    }
    var getScript = function (url, callback) {

        var elem = doc.createElement('script');

        elem.addEventListener('error', function (e) {
          //missing dependency
          console.error('The script ' + e.target.src + ' is not accessible.');
          if (typeof callback === 'function') {
            callback('error');
          }
        });

        elem.addEventListener('load', function (e) {
          //dependency is loaded successfully 
          if (typeof callback === 'function') {
            callback('success');
          }
        });

        doc.head.appendChild(elem);
        elem.src = getUrl(url);
      },

      executeModule = function (moduleName, moduleDefinition, args) {
        var moduleData;

        if (!isArray(args)) {
          args = emptyArray;
        }

        try {
          moduleData = moduleDefinition.apply(hAzzle.prototype, args);
        } catch (e) {}

        if (moduleName) {
          modules[moduleName] = moduleData;
        }
      },

      installModule = function (moduleName, status) {

        var callbacks, i = 0,
          len, fn;

        if (status === 'success') {
          if (!installed[moduleName]) {
            installed[moduleName] = true;
          }
        } else {
          failedList.push(moduleName);
        }

        callbacks = waitingList[moduleName];

        // Make sure it always has a length

        if (isArray(callbacks) && callbacks.length) {

          len = callbacks.length;

          for (; i < len; i += 1) {
            fn = callbacks[i];
            try {
              fn(status);
            } catch (e) {}
          }
          waitingList[moduleName] = [];
        }
      },

      loadModule = function (moduleName, callback) {
        var isFirstLoadDemand = false;

        if (installed[moduleName]) {

          callback(modules[moduleName]);

        } else {

          if (!isArray(waitingList[moduleName])) {
            waitingList[moduleName] = [];
            isFirstLoadDemand = true;
          }

          waitingList[moduleName].push(callback);

          if (isFirstLoadDemand) {

            getScript(moduleName, function (status) {
              loadedModules[moduleName] = true;

              if (isArray(moduleDependencies[moduleName]) &&
                moduleDependencies[moduleName].length) {
                //Do not need to do anything so far
              } else {
                installModule(moduleName, status);
              }
            });
          }
        }
      },

      loadModules = function (array, callback) {

        var i = 0,
          len = array.length,
          loaded = [];

        function pCallback(status) {
          loaded.push(status);
          if (loaded.length === len && typeof callback === 'function') {
            callback(loaded);
          }
        }

        for (; i < len; i += 1) {
          loadModule(array[i], pCallback);
        }
      },

      include = function (moduleName, array, moduleDefinition) {

        // Be 100% sure this is a function before injecting it

        if (isFunction(moduleName)) {
          moduleDefinition = moduleName;
          moduleName = undefined;
          array = emptyArray;
        }
        //define(array, moduleDefinition) 
        else if (isArray(moduleName)) {
          moduleDefinition = array;
          array = moduleName;
          moduleName = undefined;
        } else if (typeof moduleName === 'string') {
          //define(moduleName, moduleDefinition)
          if (typeof array === 'function') {
            moduleDefinition = array;
            array = emptyArray;
          }
        }

        if (isFunction(moduleDefinition)) {
          console.error('Invalid input parameter to define a module');
          return;
        }

        var moduleInfo = getFileInfo(document.currentScript.src);

        if (moduleName === undefined) {
          moduleInfo = getFileInfo(document.currentScript.src);
          moduleName = moduleInfo.fileName;
        }

        moduleDependencies[moduleName] = array.slice();

        if (isArray(array) && array.length) {
          loadModules(array, function () {
            var args = [],
              i = 0,
              len = array.length;

            for (; i < len; i += 1) {
              args.push(modules[array[i]]);
            }

            executeModule(moduleName, moduleDefinition, args);
            installModule(moduleName, 'success');

          });
        } else {
          executeModule(moduleName, moduleDefinition);
          installModule(moduleName, 'success');
        }
      },

      request = function (array, fn) {

        if (typeof fn !== 'function') {
          console.error('Invalid input parameter to require a module');
          return;
        }

        if (isArray(array) && array.length) {

          loadModules(array, function () {

            var args = [],
              i = 0,
              len = array.length;

            for (; i < len; i += 1) {
              args.push(modules[array[i]]);
            }

            executeModule(false, fn, args);
          });
        } else {
          executeModule(false, fn);
        }
      },

      config = function (cnfOptions) {
        if (!isObject(cnfOptions)) {
          return;
        }
        var keys = Object.keys(cnfOptions),
          i = 0,
          len = keys.length,
          key;
        for (; i < len; i += 1) {
          key = keys[i];
          options[key] = cnfOptions[key];
        }
      },
      //@deprecated
      // Returns an instance for `name`
      require = function (name) {
        console.warn('hAzzle.require is deprecated now, use hAzzle.request instead to support lazy loading');
        return modules[name];
      },

      //@deprecated
      // Defines a module for `name: String`, `fn: Function`,
      define = function (name, fn) {
        console.warn('hAzzle.define is deprecated now, use hAzzle.include instead to support lazy loading');
        // Check arguments
        err(typeof name !== 'string', 1, 'id must be a string "' + name + '"');
        err(modules[name], 2, 'module already included "' + name + '"');
        err(typeof fn !== 'function', 3, 'function body for "' + name + '" must be an function "' + fn + '"');

        // append to module object
        installed[name] = true;

        modules[name] = fn.call(hAzzle.prototype);
      },

      expose = function (g) {
        g.request = request;
        g.include = include;
        g.config = config;
        g.modules = modules;
        g.installed = installed;

        //deprecated hAzzle module functions
        g.require = require;
        g.define = define;
      };

    expose(hAzzle);
  }

  // Expose

  hAzzle.err = err;
  hAzzle.codename = codename;
  hAzzle.version = version;

  exposeModuleLoader(window, hAzzle);

  // Hook hAzzle on the window object
  window.hAzzle = hAzzle;

}(this));
