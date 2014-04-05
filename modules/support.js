/* 
 * Support
 */
/**
 * Check for CSS Transform and transition support
 *
 * NOTE!!
 *
 * None of this is supported in Internet Explorer 9.
 * IE9 supports an alternative for Transform, the -ms-transform property (2D transforms only).
 */
var div = document.createElement('div'),
    divStyle = div.style,
    propertyName = 'transform',
    support = hAzzle.support,
    suffix = 'Transform',
    testProperties = [
        'O' + suffix,
        'ms' + suffix,
        'Webkit' + suffix,
        'Moz' + suffix,
        // prefix-less property
        propertyName
    ],
    i = testProperties.length,
    supportProperty;

/**
 * Test different vendor prefixes of this property
 */

while (i--) {
    if (testProperties[i] in divStyle) {
        hAzzle.support[propertyName] = supportProperty = testProperties[i];
        continue;
    }
}

/**
 * px isn't the default unit of this property
 */

hAzzle.cssNumber[propertyName] = true;


support.transition =
    divStyle.MozTransition === '' ? 'MozTransition' :
    (divStyle.MsTransition === '' ? 'MsTransition' :
    (divStyle.WebkitTransition === '' ? 'WebkitTransition' :
        (divStyle.OTransition === '' ? 'OTransition' :
            (divStyle.transition === '' ? 'Transition' :
                null))));

/**
 * Prevent IE memory leak
 */

div = divStyle = null;