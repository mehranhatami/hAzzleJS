var singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
        'tr': document.createElement('tbody'),
        'tbody': table,
        'thead': table,
        'tfoot': table,
        'td': tableRow,
        'th': tableRow,
        '*': document.createElement('div')
    },

    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

    capitalRE = /([A-Z])/g;

hAzzle.extend({


    fragment: function (html, name, properties) {


        var dom, nodes, container

            // A special case optimization for a single tag
        if (singleTagRE.test(html)) dom = hAzzle(document.createElement(RegExp.$1))

        if (!dom) {
            if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
            if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
            if (!(name in containers)) name = '*'

            container = containers[name]
            container.innerHTML = '' + html
            dom = hAzzle.each(slice.call(container.childNodes), function () {
                container.removeChild(this)
            })
        }

        if (hAzzle.isPlainObject(properties)) {
            nodes = hAzzle(dom)
            hAzzle.each(properties, function (key, value) {
                if (methodAttributes.indexOf(key) > -1) nodes[key](value)
                else nodes.attr(key, value)
            })
        }

        return dom;


    }
});