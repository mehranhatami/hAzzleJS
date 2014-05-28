// MutationObserver for hAzzle
var win = this,
  MutationObserver = win.MutationObserver || win.WebKitMutationObserver,
  lifecycles = function (node) {

    var nodes = hAzzle(node).find('[observer]').toArray();
    //TODO Kenny: Check if it does the same thing
    //hAzzle(node).is('[observer]') && nodes.push(node);
    if (hAzzle(node).is('[observer]')) {
      nodes.push(node);
    }
    return nodes;
  };

var observeAttribute = function (node, callback) {
  var attributeObserver = new MutationObserver(function (mutations) {
    hAzzle.each(mutations, function (index, mutation) {
      callback(mutation.attributeName);
    });
  });

  attributeObserver.observe(node, {
    subtree: false,
    attributes: true
  });

  return attributeObserver;
};

var observer = new MutationObserver(function (mutations) {

  hAzzle.each(mutations, function (index, mutation) {
    if (mutation.type === 'childList') {
      hAzzle.each(mutation.addedNodes, function (index, node) {
        hAzzle.each(lifecycles(node), function (index, node) {
          hAzzle.each(node.whenInsert || [], function (index, callback) {
            callback();
          });
        });
      });

      hAzzle.each(mutation.removedNodes, function (index, node) {
        hAzzle.each(lifecycles(node), function (index, node) {
          hAzzle.each(node.whenRemove || [], function (index, callback) {
            callback();
          });
        });
      });
    }
  });
});

hAzzle(function () {
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});

hAzzle.extend({

  Observe: function (options) {
    var element = hAzzle(this).get(0);

    element.whenInsert = element.whenInsert || [];
    element.whenRemove = element.whenRemove || [];
    element.whenChange = element.whenChange || [];

    options = options || {};

    //TODO Kenny: Check if my code does the same
    if (options.insert) {
      element.whenInsert.push(options.insert);
    }
    if (options.remove) {
      element.whenRemove.push(options.remove);
    }
    if (options.change) {
      element.whenChange.push(observeAttribute(element, options.change));
    }

    hAzzle(this).attr('observer', '');
  },

  unObserve: function () {

    var element = hAzzle(this).get(0);

    hAzzle.each(element.whenChange, function (index, attributeObserver) {
      attributeObserver.disconnect();
    });

    delete element.whenInsert;
    delete element.whenRemove;
    delete element.whenChange;

    hAzzle(this).removeAttr('observer');
  }
});