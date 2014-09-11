/*
 * Feature tests and global variables
 */
var rAffine = /^\s*matrix\(\s*1\s*,\s*0\s*,\s*0\s*,\s*1\s*(?:,\s*0(?:px)?\s*){2}\)\s*$/;

hAzzle.TweenHooks.transform = {

    set: function(fx) {

        var elem = fx.elem,
            start = fx.start,
            end = fx.end,
            pos = fx.pos,
            transform = "",
            precision = 1E5,
            i, startVal, endVal, unit;

        if (!start || typeof start === "string") {

            // Replace "+=" in relative animations (-= is meaningless with transforms)
            // but I'm going to fix this soon. Or, Mehran fix this!!

            end = end.split("+=").join(start);

            // Use the quick copy function from fx.js module

            quickCopy(fx, interpolationList(start, end));

            start = fx.start;
            end = fx.end;
        }

        i = start.length;

        // Interpolate functions of the list one by one

        while (i--) {

            startVal = start[i];
            endVal = end[i];
            unit = +false;

            // Mehran! Temproray switch solution. Need to add template for this !!

            switch (startVal[0]) {

                case 'translate':
                    unit = "px";
                    break;
                case 'scale':
                    unit || (unit = "");

                    transform = startVal[0] + "(" +
                        Math.round((startVal[1][0] + (endVal[1][0] - startVal[1][0]) * pos) * precision) / precision + unit + "," +
                        Math.round((startVal[1][1] + (endVal[1][1] - startVal[1][1]) * pos) * precision) / precision + unit + ")" +
                        transform;
                    break;

                case 'skewX':
                case 'skewY':
                case 'rotate':
                    transform = startVal[0] + "(" +
                        Math.round((startVal[1] + (endVal[1] - startVal[1]) * pos) * precision) / precision + "rad)" +
                        transform;
                    break;
            }
        }

        fx.origin && ((transform = fx.origin + transform));

        elem.style[hAzzle.cssCore.transform] = transform;
    }
};

// Turns a transform string into its "matrix(A,B,C,D,X,Y)" form (as an array, though)

function matrix(transform) {

    transform = transform.split(")");

    var i = -1,
        l = transform.length - 1,
        split, prop, val,
        prev = [],
        curr = [],
        rslt = [1, 0, 0, 1, 0, 0];

    prev[0] = prev[3] = rslt[0] = rslt[3] = 1;
    prev[1] = prev[2] = prev[4] = prev[5] = 0;

    // Loop through the transform properties, parse and multiply them

    while (++i < l) {
        split = transform[i].split("(");
        prop = hAzzle.trim(split[0]);
        val = split[1];
        curr[0] = curr[3] = 1;
        curr[1] = curr[2] = curr[4] = curr[5] = 0;

        switch (prop) {
            case 'translateX':
                curr[4] = parseInt(val, 10);
                break;

            case 'translateY':
                curr[5] = parseInt(val, 10);
                break;

            case 'translate':
                val = val.split(",");
                curr[4] = parseInt(val[0], 10);
                curr[5] = parseInt(val[1] || 0, 10);
                break;

            case 'rotate':
                val = toRadian(val);
                curr[0] = Math.cos(val);
                curr[1] = Math.sin(val);
                curr[2] = -Math.sin(val);
                curr[3] = Math.cos(val);
                break;

            case 'scaleX':
                curr[0] = +val;
                break;

            case 'scaleY':
                curr[3] = val;
                break;

            case 'scale':
                val = val.split(",");
                curr[0] = val[0];
                curr[3] = val.length > 1 ? val[1] : val[0];
                break;

            case 'skewX':
                curr[2] = Math.tan(toRadian(val));

                break;

            case 'skewY':
                curr[1] = Math.tan(toRadian(val));
                break;

            case 'matrix':
                val = val.split(",");
                curr[0] = val[0];
                curr[1] = val[1];
                curr[2] = val[2];
                curr[3] = val[3];
                curr[4] = parseInt(val[4], 10);
                curr[5] = parseInt(val[5], 10);
                break;
        }

        // Matrix product (array in column-major order)
        rslt[0] = prev[0] * curr[0] + prev[2] * curr[1];
        rslt[1] = prev[1] * curr[0] + prev[3] * curr[1];
        rslt[2] = prev[0] * curr[2] + prev[2] * curr[3];
        rslt[3] = prev[1] * curr[2] + prev[3] * curr[3];
        rslt[4] = prev[0] * curr[4] + prev[2] * curr[5] + prev[4];
        rslt[5] = prev[1] * curr[4] + prev[3] * curr[5] + prev[5];

        prev = [rslt[0], rslt[1], rslt[2], rslt[3], rslt[4], rslt[5]];
    }
    return rslt;
}

// Turns a matrix into its rotate, scale and skew components
// Algorithm from http://hg.mozilla.org/mozilla-central/file/7cb3e9795d04/layout/style/nsStyleAnimation.cpp

function unmatrix(matrix) {

    var scaleX,
        scaleY,
        skew,
        A = matrix[0],
        B = matrix[1],
        C = matrix[2],
        D = matrix[3];

    // Make sure matrix is not singular
    if (A * D - B * C) {
        // step (3)
        scaleX = Math.sqrt(A * A + B * B);
        A /= scaleX;
        B /= scaleX;
        // step (4)
        skew = A * C + B * D;
        C -= A * skew;
        D -= B * skew;
        // step (5)
        scaleY = Math.sqrt(C * C + D * D);
        C /= scaleY;
        D /= scaleY;
        skew /= scaleY;
        // step (6)
        if (A * D < B * C) {
            A = -A;
            B = -B;
            skew = -skew;
            scaleX = -scaleX;
        }

        // Matrix is singular and cannot be interpolated

    } else {

        // In this case the elem shouldn't be rendered, hence scale == 0
        scaleX = scaleY = skew = 0;
    }

    // The recomposition order is very important
    // see http://hg.mozilla.org/mozilla-central/file/7cb3e9795d04/layout/style/nsStyleAnimation.cpp#l971

    return [
        ['translate', [+matrix[4], +matrix[5]]],
        ['rotate', Math.atan2(B, A)],
        ['skewX', Math.atan(skew)],
        ['scale', [scaleX, scaleY]]
    ];
}

// Build the list of transform functions to interpolate
// Use the algorithm described at http://dev.w3.org/csswg/css3-2d-transforms/#animation

function interpolationList(start, end) {

    var list = {
            start: [],
            end: []
        },
        i = -1,
        l,
        currStart, currEnd, currType;

    // Get rid of affine transform matrix

    (start == "none" || isAffine(start)) && (start = "");
    (end == "none" || isAffine(end)) && (end = "");

    // if end starts with the current computed style, this is a relative animation
    // store computed style as the origin, remove it from start and end
    if (start && end && !end.indexOf("matrix") && toArray(start).join() == toArray(end.split(")")[0]).join()) {
        list.origin = start;
        start = "";
        end = end.slice(end.indexOf(")") + 1);
    }

    if (!start && !end) {
        return;
    }

    // start or end are affine, or list of transform functions are identical
    // => functions will be interpolated individually
    if (!start || !end || functionList(start) == functionList(end)) {

        start && (start = start.split(")")) && (l = start.length);
        end && (end = end.split(")")) && (l = end.length);

        while (++i < l - 1) {
            start[i] && (currStart = start[i].split("("));
            end[i] && (currEnd = end[i].split("("));
            currType = hAzzle.trim((currStart || currEnd)[0]);

            append(list.start, parseFunction(currType, currStart ? currStart[1] : 0));
            append(list.end, parseFunction(currType, currEnd ? currEnd[1] : 0));
        }

        // otherwise, functions will be composed to a single matrix
    } else {
        list.start = unmatrix(matrix(start));
        list.end = unmatrix(matrix(end));
    }

    return list;
}

function parseFunction(type, value) {

    var
    // Default value is 1 for scale, 0 otherwise

        defaultValue = +(!type.indexOf('scale')),
        scaleX,

        // Remove X/Y from scaleX/Y & translateX/Y, not from skew

        cat = type.replace(/e[XY]/, "e");

    switch (type) {
        case 'translateY':
        case 'scaleY':

            value = [
                defaultValue,
                value ?
                parseFloat(value) :
                defaultValue
            ];
            break;

        case 'translateX':
        case 'translate':
        case 'scaleX':
            scaleX = 1;
            break;
        case 'scale':

            value = value ?
                (value = value.split(",")) && [
                    parseFloat(value[0]),
                    parseFloat(value.length > 1 ? value[1] : type == 'scale' ? scaleX || value[0] : defaultValue + "")
                ] : [defaultValue, defaultValue];
            break;

        case 'skewX':
        case 'skewY':
        case 'rotate':
            value = value ? toRadian(value) : 0;
            break;

        case 'matrix':
            return unmatrix(value ? toArray(value) : [1, 0, 0, 1, 0, 0]);
    }

    return [
        [cat, value]
    ];
}

function isAffine(matrix) {
    return rAffine.test(matrix);
}

function functionList(transform) {
    return transform.replace(/(?:\([^)]*\))|\s/g, "");
}

function append(arr1, arr2, value) {
    while (value = arr2.shift()) {
        arr1.push(value);
    }
}

// converts an angle string in any unit to a radian Float
function toRadian(value) {
    return ~value.indexOf("deg") ?
        parseInt(value, 10) * (Math.PI * 2 / 360) :
        ~value.indexOf("grad") ?
        parseInt(value, 10) * (Math.PI / 200) :
        parseFloat(value);
}

// Converts "matrix(A,B,C,D,X,Y)" to [A,B,C,D,X,Y]
function toArray(matrix) {
    // Remove the unit of X and Y for Firefox
    matrix = /([^,]*),([^,]*),([^,]*),([^,]*),([^,p]*)(?:px)?,([^)p]*)(?:px)?/.exec(matrix);
    return [matrix[1], matrix[2], matrix[3], matrix[4], matrix[5], matrix[6]];
}

hAzzle.transform = {
    centerOrigin: "margin"
};