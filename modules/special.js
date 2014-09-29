// special.js

function quickQuery(selector, context) {

    if (!selector || !context) {
        return [];
    }
    return context.querySelector(selector + '');
}

hAzzle.extend({

    'CONTAINS': function(el, args, p, arrfunc) {
        args = compileExpr.containsArg.exec(args);
        return Expr.attr(el, '.textContent', '*=', args[1], args[2], arrfunc);
    },

    // Same as the 'has' pseudo - what is the point?

    'WITH': function(el, args, p, arrfunc) {
        return quickQuery(tokenize(args, el, arrfunc), el.ownerDocument);
    },

    'HAS': function(el, args, p, arrfunc) {
        return quickQuery(tokenize(args, el, arrfunc), el.ownerDocument);
    },

    'ANY-LINK': function(el) {
        var id = el.id;
        if (id) {
            return quickQuery('a[href$=\'#' + id + '\']', el.ownerDocument);
        }
    },

    'EVEN': function() {
        return !Boolean(this.currentIndex % 2);
    },

    'ODD': function() {
        return Boolean(this.currentIndex % 2);
    },

    'EQ': function(el, args) {
        return (hAzzle.isNumeric(args) && parseInt(args, 10) === this.currentIndex);
    },

    'FIRST': function() {
        return (this.currentIndex === 0);
    },

    'LAST': function() {
        var info = this;
        return (info.currentIndex === info.elems.length - 1);
    },

    'GT': function(el, args) {
        var info = this,
            ind = parseInt(args, 10),
            len = info.elems.length;

        return (info.currentIndex > (len + ind) % len);
    },

    'LT': function(el, args) {
        var info = this,
            ind = parseInt(args, 10),
            len = info.elems.length;

        return (info.currentIndex < (len + ind) % len);
    }
}, Expr);