// tween.js

hAzzle.tween = function(elem, to, settings) {

    var method, fx;

    // Get data from the element, and stop all 
    // running tweens

    if ((fx = hAzzle.getData(elem, 'fx'))) {
        fx.stop();
    }

    // Force to use 'normal mode' or 'transform mode'

    if (!settings || !settings.mode) {
        if (!supportTransform || !hAzzle.supportTransform) {
            method = hAzzle.FX;
        } else {
            method = hAzzle.Transform;
        }
    } else if (settings.mode === 'timeline' || !supportTransform) {
        method = hAzzle.FX;
    } else {
        method = hAzzle.Transform;
    }
  
    new method(elem, to, settings);
};