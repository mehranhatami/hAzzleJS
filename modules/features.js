 /**
   * An function used to flag environments/features.
   */
  var win = this;

  hAzzle.features = function () {

      var checkOn,
          doc = document,
          optSelected,
          optDisabled,
          radioValue,
          proto = Element.prototype,
          input = doc.createElement("input"),
          select = doc.createElement("select"),
          opt = select.appendChild(doc.createElement("option"));

      input.type = "checkbox";

      checkOn = input.value !== "";

      optSelected = opt.selected;

      select.disabled = true;

      optDisabled = !opt.disabled;

      input = doc.createElement("input");
      input.value = "t";
      input.type = "radio";

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
          e = doc.createElement('p');
      clsp = !!e.classList;

      if (e.parentNode) {
          e.parentNode.removeChild(e);
      }

      e = null;

      var checkClone,
          noCloneChecked,
          fragment = doc.createDocumentFragment(),
          divv = fragment.appendChild(doc.createElement("div")),
          inp = doc.createElement("input");

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

      var dcl, d = doc.createElement('div');

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

          // Check for classList support

          clsp: clsp,

          noCloneChecked: noCloneChecked,

          checkClone: checkClone,

          // Check if support computedStyle

          computedStyle: doc.defaultView && doc.defaultView.getComputedStyle,

          // Check if support RAF

          supportRAF: !!win.requestAnimationFrame,

          classList: clsp,

          sMa: dcl,

          // Check if getElementsByClassName are supported 

          gEBCN: assert(function (div) {
              div.innerHTML = "<div class='a'></div><div class='a i'></div>";
			  div.firstChild.className = "i";
		     return div.getElementsByClassName("i").length === 2;
          }),

          // Check if getElementById returns elements by name (IE 9)

          gEBI: assert(function (div) {
              var sid = "hAzzle" + -(new Date());
              doc.documentElement.appendChild(div).id = sid;
              return !doc.getElementsByName || !doc.getElementsByName(sid).length;
          }),
		  
		  // MatchesSelector
		  // Use un-prefixed if we can
		   mS: proto.matches ||
               proto.webkitMatchesSelector ||
               proto.mozMatchesSelector ||
             //  proto.msMatchesSelector || - QSA faster in Internet Explorer
               proto.oMatchesSelector
      };

  }();
  
  function assert(fn) {
      var div = document.createElement("div");

      try {
          return !!fn(div);
      } catch (e) {
          return false;
      } finally {
          // Remove from its parent by default
          if (div.parentNode) {
              div.parentNode.removeChild(div);
          }
          // release memory in IE
          div = null;
      }
  }
  
