  /**
   * An function used to flag environments/features.
   */
  var win = this;

  hAzzle.features = function () {

      var checkOn,
          optSelected,
          optDisabled,
          radioValue,

          input = document.createElement("input"),
          select = document.createElement("select"),
          opt = select.appendChild(document.createElement("option"));

      input.type = "checkbox";

      checkOn = input.value !== "";

      optSelected = opt.selected;

      select.disabled = true;

      optDisabled = !opt.disabled;

      input = document.createElement("input");
      input.value = "t";
      input.type = "radio";

      input.setAttribute('type', 'radio');
      input.setAttribute('name', 't');

      radioValue = input.value === "t";

      if (input.parentNode) {
          input.parentNode.removeChild(input);
      }

      if (select.parentNode) {
          select.parentNode.removeChild(select);
      }

      if (opt.parentNode) {
          opt.parentNode.removeChild(opt);
      }

      input = select = opt = null;

      var clsp,
          e = document.createElement('p');
      clsp = !!e.classList;

      if (e.parentNode) {
          e.parentNode.removeChild(e);
      }

      e = null;

      var div = document.createElement('div'),
          style = div.style,
          boxShadow =
          'boxShadow' in style ? 'boxShadow' :
          'MozBoxShadow' in style ? 'MozBoxShadow' :
          'WebkitBoxShadow' in style ? 'WebkitBoxShadow' :
          'OBoxShadow' in style ? 'OBoxShadow' :
          'msBoxShadow' in style ? 'msBoxShadow' :
          false;

      // Add to hAzzle.cssProps

      if (boxShadow !== 'boxShadow') {
          hAzzle.cssProps.boxShadow = boxShadow;
      }

      if (div.parentNode) {
          div.parentNode.removeChild(div);
      }

      div = null;


      var checkClone,
          noCloneChecked,
          fragment = document.createDocumentFragment(),
          divv = fragment.appendChild(document.createElement("div")),
          inp = document.createElement("input");

      inp.setAttribute("type", "radio");
      inp.setAttribute("checked", "checked");
      inp.setAttribute("name", "t");

      divv.appendChild(inp);

      checkClone = divv.cloneNode(true).cloneNode(true).lastChild.checked;

      divv.innerHTML = "<textarea>x</textarea>";
      noCloneChecked = !!divv.cloneNode(true).lastChild.defaultValue;

      if (inp.parentNode) {
          inp.parentNode.removeChild(inp);
      }

      input = fragment = null;

      var dcl, d = document.createElement('div');

      d.classList.add('a', 'b');

      dcl = /(^| )a( |$)/.test(d.className) && /(^| )b( |$)/.test(d.className);

      if (d.parentNode) {
          d.parentNode.removeChild(d);
      }

      d = null;

      return {
          checkOn: checkOn,
          optSelected: optSelected,
          optDisabled: optDisabled,
          radioValue: radioValue,

          // CSS transform

          transform: function () {
              var props = ['transform', 'webkitTransform', 'MozTransform', 'OTransform', 'msTransform'],
                  i;
              for (i = 0; i < props.length; i++) {
                  if (props[i] in style) {

                      return props[i];
                  }
              }
          },

          // Check for classList support

          clsp: clsp,

          noCloneChecked: noCloneChecked,

          checkClone: checkClone,

          // Check if support computedStyle

          computedStyle: document.defaultView && document.defaultView.getComputedStyle,

          // Check if support RAF

          supportRAF: !!win.requestAnimationFrame,

          sMa: dcl
      };

  }();
  
 alert (  hAzzle.features.noCloneChecked )