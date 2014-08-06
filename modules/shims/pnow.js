// Performance.now polyfill
(function(p){
  if (!p.now){
    var start = (p.timing && p.timing.navigationStart) || hAzzle.now();
    p.now = function now() {
      return hAzzle.now() - start;
    };
  }
})( this.performance || ( this.performance = {} ) );