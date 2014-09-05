/**
 * EXAMPLE PLUGIN TO DEMONSTRATE HOW TO ADD CSS TRANSFORM !!!
 * - Work in progress!
 */

var	 rotate = /rotate\(((?:[+\-]=)?([\-\d\.]+))deg\)/
    , scale = /scale\(((?:[+\-]=)?([\d\.]+))\)/
    , skew = /skew\(((?:[+\-]=)?([\-\d\.]+))deg, ?((?:[+\-]=)?([\-\d\.]+))deg\)/
    , translate = /translate\(((?:[+\-]=)?([\-\d\.]+))px, ?((?:[+\-]=)?([\-\d\.]+))px\)/;
 
hAzzle.fxBefore.transform = function(elem, index, value, options) { 

    var values = {}, m, base = false
	   
    if (m = value.match(rotate)) values.rotate = by(m[1], base ? base.rotate : null)
    if (m = value.match(scale)) values.scale = by(m[1], base ? base.scale : null)
    if (m = value.match(skew)) {values.skewx = by(m[1], base ? base.skewx : null); values.skewy = by(m[3], base ? base.skewy : null)}
    if (m = value.match(translate)) {values.translatex = by(m[1], base ? base.translatex : null); values.translatey = by(m[3], base ? base.translatey : null)}

    return values

  }
 
hAzzle.fxAfter.transform = {
		  
   set:function(fx) {
   
 fx.elem.style.transform = formatTransform(fx.pos)

}};

 function formatTransform(v) {
    var s = ''
    if ('rotate' in v) s += 'rotate(' + v.rotate + 'deg) '
    if ('scale' in v) s += 'scale(' + v.scale + ') '
    if ('translatex' in v) s += 'translate(' + v.translatex + 'px,' + v.translatey + 'px) '
    if ('skewx' in v) s += 'skew(' + v.skewx + 'deg,' + v.skewy + 'deg)'
    return s;
  }

 // support for relative movement via '+=n' or '-=n'
  function by(val, start, m, r, i) {
    return (m = /^([+\-])=([\d\.]+)/.exec(val)) ?
      (i = parseFloat(m[2])) && (start + (m[1] == '+' ? 1 : -1) * i) :
      parseFloat(val)
  }
