// Feature detection of major browsers

hAzzle.isFirefox = !(window.mozInnerScreenX == null); // Firefox
hAzzle.isWebkit = 'WebkitAppearance' in document.documentElement.style // Webkit

// TODO!! Fix this - not working !!

hAzzle.isIE = (!+"\v1")?true:false; // IE