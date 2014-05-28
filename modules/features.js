  /**
   * An function used to flag environments/features.
   */
  var win = this,
    doc = win.document;

  hAzzle.features = function () {

    var input = doc.createElement('input'),
      select = doc.createElement('select'),
      opt = select.appendChild(doc.createElement('option')),
      checkOn,
      ncc,
      dcl,
      div = doc.createElement('div'),
      fragment = doc.createDocumentFragment(),
      dfdiv = fragment.appendChild(div),
      mehran,
      ccs,
      clsp,
      e = doc.createElement('p'),
      style = e.style;

    checkOn = input.value !== '';

    select.disabled = true;

    input.setAttribute('type', 'radio');
    input.setAttribute('checked', 'checked');
    input.setAttribute('name', 't');

    div.classList.add('a', 'b');

    dfdiv.appendChild(input);

    mehran = dfdiv.cloneNode(true).cloneNode(true).lastChild.checked;

    // Make sure textarea (and checkbox) defaultValue is properly cloned
    // Support: IE9-IE11+

    dfdiv.innerHTML = '<textarea>x</textarea>';

    ccs = div.style.backgroundClip === 'content-box';
    dcl = /(^| )a( |$)/.test(div.className) && /(^| )b( |$)/.test(div.className);
    ncc = !! dfdiv.cloneNode(true).lastChild.defaultValue;
    clsp = !! e.classList;

    // Remove from its parent by default

    if (div.parentNode) {
      div.parentNode.removeChild(div);
    }

    if (dfdiv.parentNode) {
      dfdiv.parentNode.removeChild(dfdiv);
    }

    if (e.parentNode) {
      e.parentNode.removeChild(e);
    }

    // release memory in IE

    div = dfdiv = e = null;

    return {
      clearCloneStyle: ccs,
      checkClone: mehran,
      noCloneChecked: ncc,
      checkOn: checkOn,
      optSelected: opt.selected,
      optDisabled: !opt.disabled,
      radioValue: input.name === 't',

      transform: function () {
        var props = ['transform', 'webkitTransform', 'MozTransform', 'OTransform', 'msTransform'],
          i;
        for (i = 0; i < props.length; i++) {
          if (props[i] in style) {

            return props[i];
          }
        }
      },
      classList: clsp,
      sMa: dcl
    };

  }();