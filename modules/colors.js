// Colors
;
(function ($) {

    var props = "backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor borderColor boxShadowColor color textShadowColor columnRuleColor outlineColor textDecorationColor textEmphasisColor".split(' ');

    $.extend($, {

        /**
         * hAzzle color names
         *
		 * NOTE!! Only the most used RGB colors are listed, if you need more, you have to
		 * create a plug-in for it.
		 *
         */

        colornames: {
            aliceblue: {
                r: 240,
                g: 248,
                b: 255
            },
            antiquewhite: {
                r: 250,
                g: 235,
                b: 215
            },
            aqua: {
                r: 0,
                g: 255,
                b: 255
            },
            aquamarine: {
                r: 127,
                g: 255,
                b: 212
            },
            azure: {
                r: 240,
                g: 255,
                b: 255
            },
            beige: {
                r: 245,
                g: 245,
                b: 220
            },
            bisque: {
                r: 255,
                g: 228,
                b: 196
            },
            black: {
                r: 0,
                g: 0,
                b: 0
            },
            blue: {
                r: 0,
                g: 0,
                b: 255
            },
            blueviolet: {
                r: 138,
                g: 43,
                b: 226
            },
            brown: {
                r: 165,
                g: 42,
                b: 42
            },
            burlywood: {
                r: 222,
                g: 184,
                b: 135
            },
            cadetblue: {
                r: 95,
                g: 158,
                b: 160
            },
            coral: {
                r: 255,
                g: 127,
                b: 80
            },
            crimson: {
                r: 220,
                g: 20,
                b: 60
            },
            cyan: {
                r: 0,
                g: 255,
                b: 255
            },
            darkblue: {
                r: 0,
                g: 0,
                b: 139
            },
            darkcyan: {
                r: 0,
                g: 139,
                b: 139
            },
            darkgray: {
                r: 169,
                g: 169,
                b: 169
            },
            darkgreen: {
                r: 0,
                g: 100,
                b: 0
            },
            darkgrey: {
                r: 169,
                g: 169,
                b: 169
            },
            darkmagenta: {
                r: 139,
                g: 0,
                b: 139
            },
            darkolivegreen: {
                r: 85,
                g: 107,
                b: 47
            },
            darkred: {
                r: 139,
                g: 0,
                b: 0
            },
            darksalmon: {
                r: 233,
                g: 150,
                b: 122
            },
            darkseagreen: {
                r: 143,
                g: 188,
                b: 143
            },
            darkviolet: {
                r: 148,
                g: 0,
                b: 211
            },

            gold: {
                r: 255,
                g: 215,
                b: 0
            },
            goldenrod: {
                r: 218,
                g: 165,
                b: 32
            },
            green: {
                r: 0,
                g: 128,
                b: 0
            },
            greenyellow: {
                r: 173,
                g: 255,
                b: 47
            },
            grey: {
                r: 128,
                g: 128,
                b: 128
            },
            indianred: {
                r: 205,
                g: 92,
                b: 92
            },
            indigo: {
                r: 75,
                g: 0,
                b: 130
            },
            ivory: {
                r: 255,
                g: 255,
                b: 240
            },
            lavender: {
                r: 230,
                g: 230,
                b: 250
            },
            lightblue: {
                r: 173,
                g: 216,
                b: 230
            },
            lightcoral: {
                r: 240,
                g: 128,
                b: 128
            },
            lightcyan: {
                r: 224,
                g: 255,
                b: 255
            },
            lightgray: {
                r: 211,
                g: 211,
                b: 211
            },
            lightgreen: {
                r: 144,
                g: 238,
                b: 144
            },
            lightgrey: {
                r: 211,
                g: 211,
                b: 211
            },
            lightpink: {
                r: 255,
                g: 182,
                b: 193
            },
            lightyellow: {
                r: 255,
                g: 255,
                b: 224
            },
            lime: {
                r: 0,
                g: 255,
                b: 0
            },
            limegreen: {
                r: 50,
                g: 205,
                b: 50
            },
            linen: {
                r: 250,
                g: 240,
                b: 230
            },
            magenta: {
                r: 255,
                g: 0,
                b: 255
            },
            maroon: {
                r: 128,
                g: 0,
                b: 0
            },
            midnightblue: {
                r: 25,
                g: 25,
                b: 112
            },
            moccasin: {
                r: 255,
                g: 228,
                b: 181
            },
            olive: {
                r: 128,
                g: 128,
                b: 0
            },
            olivedrab: {
                r: 107,
                g: 142,
                b: 35
            },
            orange: {
                r: 255,
                g: 165,
                b: 0
            },
            orangered: {
                r: 255,
                g: 69,
                b: 0
            },
            orchid: {
                r: 218,
                g: 112,
                b: 214
            },
            peru: {
                r: 205,
                g: 133,
                b: 63
            },
            pink: {
                r: 255,
                g: 192,
                b: 203
            },
            plum: {
                r: 221,
                g: 160,
                b: 221
            },
            purple: {
                r: 128,
                g: 0,
                b: 128
            },
            red: {
                r: 255,
                g: 0,
                b: 0
            },
            salmon: {
                r: 250,
                g: 128,
                b: 114
            },
            sandybrown: {
                r: 244,
                g: 164,
                b: 96
            },
            sienna: {
                r: 160,
                g: 82,
                b: 45
            },
            silver: {
                r: 192,
                g: 192,
                b: 192
            },
            skyblue: {
                r: 135,
                g: 206,
                b: 235
            },
            snow: {
                r: 255,
                g: 250,
                b: 250
            },
            tomato: {
                r: 255,
                g: 99,
                b: 71
            },
            turquoise: {
                r: 64,
                g: 224,
                b: 208
            },
            violet: {
                r: 238,
                g: 130,
                b: 238
            },
            wheat: {
                r: 245,
                g: 222,
                b: 179
            },
            white: {
                r: 255,
                g: 255,
                b: 255
            },
            whitesmoke: {
                r: 245,
                g: 245,
                b: 245
            },
            yellow: {
                r: 255,
                g: 255,
                b: 0
            },
            yellowgreen: {
                r: 154,
                g: 205,
                b: 50
            },
            transparent: {
                r: -1,
                g: -1,
                b: -1
            }
        },

        color: {
            normalize: function (input) {
                var color, alpha,
                    result, name, i, l,
                    rhex = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/,
                    rhexshort = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/,
                    rrgb = /rgb(?:a)?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(0*\.?\d+)\s*)?\)/,
                    rrgbpercent = /rgb(?:a)?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(0*\.?\d+)\s*)?\)/,
                    rhsl = /hsl(?:a)?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(0*\.?\d+)\s*)?\)/;

                // Handle color: #rrggbb
                if (result = rhex.exec(input)) {
                    color = {
                        r: parseInt(result[1], 16),
                        g: parseInt(result[2], 16),
                        b: parseInt(result[3], 16),
                        source: result[0]
                    };
                }
                // Handle color: #rgb
                else if (result = rhexshort.exec(input)) {
                    color = {
                        r: parseInt(result[1] + result[1], 16),
                        g: parseInt(result[2] + result[2], 16),
                        b: parseInt(result[3] + result[3], 16),
                        source: result[0]
                    };
                }
                // Handle color: rgb[a](r, g, b [, a])
                else if (result = rrgb.exec(input)) {
                    color = {
                        r: parseInt(result[1], 10),
                        g: parseInt(result[2], 10),
                        b: parseInt(result[3], 10),
                        alpha: parseFloat(result[4], 10),
                        source: result[0]
                    };
                }
                // Handle color: rgb[a](r%, g%, b% [, a])
                else if (result = rrgbpercent.exec(input)) {
                    color = {
                        r: parseInt(result[1] * 2.55, 10),
                        g: parseInt(result[2] * 2.55, 10),
                        b: parseInt(result[3] * 2.55, 10),
                        alpha: parseFloat(result[4], 10),
                        source: result[0]
                    };
                }
                // Handle color: hsl[a](h%, s%, l% [, a])
                else if (result = rhsl.exec(input)) {
                    color = $.color.hsl_to_rgb(
                        parseFloat(result[1], 10) / 100,
                        parseFloat(result[2], 10) / 100,
                        parseFloat(result[3], 10) / 100
                    );
                    color.alpha = parseFloat(result[4], 10);
                    color.source = result[0];
                }
                // Handle color: name
                else {
                    result = input.split(' ');

                    i = 0,
                    l = result.length;

                    for (; i < l; i++) {

                        name = result[i];

                        if ($.colornames[name]) {
                            break;
                        }
                    }

                    if (!$.colornames[name]) {
                        name = 'transparent';
                    }

                    color = $.colornames[name];
                    color.source = name;
                }

                if (!color.alpha && color.alpha !== 0) {
                    delete color.alpha;
                }

                return color;
            },

            hsl_to_rgb: function (h, s, l, a) {
                var r, g, b, m1, m2;

                if (s === 0) {
                    r = g = b = l;
                } else {
                    if (l <= 0.5) {
                        m2 = l * (s + 1);
                    } else {
                        m2 = (l + s) - (l * s);
                    }

                    m1 = (l * 2) - m2;
                    r = parseInt(255 * $.color.hue2rgb(m1, m2, h + (1 / 3)), 10);
                    g = parseInt(255 * $.color.hue2rgb(m1, m2, h), 10);
                    b = parseInt(255 * $.color.hue2rgb(m1, m2, h - (1 / 3)), 10);
                }

                return {
                    r: r,
                    g: g,
                    b: b,
                    alpha: a
                };
            },

            // hsla conversions adapted from:
            // https://code.google.com/p/maashaack/source/browse/packages/graphics/trunk/src/graphics/colors/HUE2RGB.as?r=5021			

            hue2rgb: function (p, q, h) {

                if (h < 0) {

                    h++;
                }

                if (h > 1) {

                    h--;
                }

                if ((h * 6) < 1) {
                    return p + ((q - p) * h * 6);
                } else if ((h * 2) < 1) {
                    return q;
                } else if ((h * 3) < 2) {
                    return p + ((q - p) * ((2 / 3) - h) * 6);
                } else {
                    return p;
                }
            }
        }
    });

    $.each(props, function (i, hook) {

        $.cssHooks[hook] = {
            set: function (elem, value) {

                value = $.color.normalize(value);

                if (!value.alpha) {
                    value.alpha = 1;
                }

                elem.style[hook] = 'rgba(' + value.r + ',' + value.g + ',' + value.b + ',' + value.alpha + ')';
            }
        };
    });

    $.cssHooks.borderColor = {
        expand: function (value) {
            var expanded = {};

            $.each(["Top", "Right", "Bottom", "Left"], function (i, part) {
                expanded["border" + part + "Color"] = value;
            });
            return expanded;
        }
    };


})(hAzzle);