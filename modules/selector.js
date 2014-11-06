// selector.js
// hAzzle main selector engine
var hAzzle = window.hAzzle || (window.hAzzle = {});

hAzzle.include(['types'], function(_types) {

    //A temporary solution just to test it as a module!
    var find = function(sel, ctx) {
        if (!ctx) {
            ctx = document;
        }
        if (_types.isType('Function')(ctx.querySelectorAll)) {
            return ctx.querySelectorAll(sel);
        } else {
            console.log('selector probably needs jiesa for this type of context!');
        }
    };

    return {
        find: find
    };

});
