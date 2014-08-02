// Performance.now polyfill for IE 9 and browsers who don't support it
(function(p){
  if (!p.now){
    var start = (p.timing && p.timing.navigationStart) || Date.now();
    p.now = function now() {
      return Date.now() - start;
    };
  }
})( this.performance || ( this.performance = {} ) );