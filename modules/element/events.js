hAzzle.define('Events', function () {

this.on = function(evt, fn) {
    this.elements[0].addEventListener(evt, fn, false);
}



    return {
    };
});