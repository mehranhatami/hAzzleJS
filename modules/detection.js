// Feature detection of major browsers

var isOpera = hAzzle.isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0; // Opera
hAzzle.isFirefox = typeof InstallTrigger !== 'undefined'; // Firefox
hAzzle.isChrome = !!window.chrome && !isOpera;              // Chrome 1+
hAzzle.isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
hAzzle.isIE = false || !!document.documentMode; // IE