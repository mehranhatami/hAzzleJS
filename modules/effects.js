/**
 * A few animation effects supported by hAzzle
 */
;
(function ($) {

    var directions = ["height", "marginTop", "marginBottom", "paddingTop", "paddingBottom"],
        cut = function (type, num) {

            var obj = {};

            $.each(directions.concat.apply([], directions.slice(0, num)), function () {

                obj[this] = type;
            });

            return obj;
        };

    $.extend($.fn, {

        slideDown: function (speed, callback) {
            return this.animate(cut("show", 1), speed, callback);
        },
        slideUp: function (speed, callback) {
            return this.animate(cut("show", 1), speed, callback);
        },
        slideToggle: function (speed, callback) {
            hAzzle(this).animate(cut("toggle", 1), speed, callback);
        },
        fadeIn: function (speed, callback) {
            return this.animate({
                opacity: "show"
            }, speed, callback);
        },
        fadeOut: function (speed, callback) {
            return this.animate({
                opacity: "hide"
            }, speed, callback);
        }
    });


})(hAzzle);