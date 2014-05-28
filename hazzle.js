/*! hazzle v0.0.0 - MIT license */

(function (win) {
  function moduleDefinition() {
    return win.hAzzle;
  }
  var path = 'modules/',
    hazzleModules = [
      path + 'hazzle.js',
      path + 'features.js',
      path + 'selector.js',
      path + 'traversing.js',
      path + 'css.js',
      path + 'classes.js',
      path + 'manipulation.js',
      path + 'removeable.js',
      path + 'events.js',
      path + 'data.js',
      path + 'clone.js',
      path + 'parsing.js',
      path + 'observer.js',
      path + 'localestorage.js',
      path + 'browser.js'
    ];
  if (typeof exports === 'object') {
    // node export
    module.exports = moduleDefinition();
  } else if (typeof define === 'function' && define.amd) {
    // amd anonymous module registration
    define(hazzleModules, moduleDefinition);
  } else {
    // browser global
    win.hAzzle = moduleDefinition();
  }
}(this));