/**
 * Lightweight, but powerfull animation engine
 *
 *  BUGGY WORK IN PROGRESS !!!!!!
 *
 * Features:
 *
 * - RAF support
 * - Animation of single and multiple elements
 * - Animation of border colors
 * - Animation of background colors
 * - Background animation
 * - Build-in hooks for CSS transformation support (external plugin)
 *
 * hAzzle functions added here:
 *
 * - fadeIn
 * - fadeOut
 */
  
var dictionary = [],
    defaultEase = 'easeOutQuad',
    engineRunning,
    defaultDuration = 500,
    trans,
    timer,
    intervalSpeed,
    borColor,
    rip,
    moved,
    cancel = hAzzle.prefix('CancelAnimationFrame'),
    request = hAzzle.prefix('RequestAnimationFrame'),

    clrs = /(#|rgb)/,
    gotcha = /(auto|inherit|rgb|%|#)/,

    // credit: http://www.bitstorm.org/jquery/color-animation/
    color2 = /#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])/,
    color1 = /#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/;

 /**
  * Our animation engine
  */

function engine() {

  var run = false,
      leg = length,
	  internal;

    while (leg--) {

        internal = dictionary[leg];

        if (!internal) break;
        if (internal.transactive) continue;
		
        if (internal.cycle()) {

            run = true;

        } else {

            internal.stop(false, internal.complete, false, true);
        }

    }

    if (request) {

        if (run) {

            request(engine);

        } else {

            cancel(engine);
            internal = trans = null;
        }

    } else {

        if (run) {

            if (!engineRunning) timer = setInterval(engine, intervalSpeed);

        } else {

            clearInterval(timer);
            internal = trans = null;

        }

    }

    engineRunning = run;

}

function Tween(obj, to, sets) {

    length = dictionary.length;

    hAzzle.data(obj, 'cj', dictionary[length++] = this);

    var $this = hAzzle.data(obj, 'cj');

    this.runner = function (force) {
        $this.obj = obj;
        $this.complete = sets.callback;
        $this.completeParams = sets.callbackParams;

        if (force === true) {

            $this.transitions = [];
            return;

        }

        var key,
            i = 0,
            tweens = [],
            style = obj.style,
            duration = sets.duration || defaultDuration,
            easing = hAzzle.isFunction(hAzzle.easing[defaultEase]) ? hAzzle.easing[defaultEase] : hAzzle.easing[sets.ease];

        style.visibility = "visible";

        if (sets.fadeIn) {

            style.display = sets.display || "block";
            style.opacity = 0;

        }
        
		// Animation of border colors
        
		if (to.borderColor && !borColor) {

            var clr = to.borderColor;

            to.borderTopColor = clr;
            to.borderRightColor = clr;
            to.borderBottomColor = clr;
            to.borderLeftColor = clr;

            delete to.borderColor;

        }

        for (key in to) {

            if (!to.hasOwnProperty(key)) continue;

            // Background animation
			
            if (key === "backgroundPosition") {

                tweens[i++] = $this.bgPosition(obj, key, to[key], duration, easing);                

            } else {

                tweens[i++] = $this.animate(obj, key, to[key], duration, easing);
            }

        }

        $this.transitions = tweens;
        (engineRunning) ? setTimeout(checkEngine, 10) : engine();

    };

    if (sets.fadeOut) {

        hAzzle.data(obj, 'fadeOut', true);

    } else if (sets.fadeIn) {

        hAzzle.data(obj, 'fadeIn', true);

    }

    if (sets.duration === 0) {

        this.runner(true);
        this.stop();
        return;

    }

    if (!sets.delay) {

        this.runner();

    } else {

        this.delayed = setTimeout(this.runner, sets.delay);

    }
}


Tween.prototype = {

    cycle: function () {

        trans = this.transitions;
        if (!trans) return true;

        rip = trans.length;
        moved = false;

        while (rip--) {

            if (trans[rip]()) moved = true;

        }

        return moved;

    },


    animate: function (obj, prop, value, duration, ease) {

        var tick, opacity = prop === "opacity",
            passed = true;
        tick = curCSS(obj, prop);

        if (!gotcha.test(tick)) {

            tick = parseFloat(tick);

        } else {

            if (!clrs.test(tick)) {

                tick = 0;

            } else {

                if (value.search("rgb") === -1) {

                    return this.color(obj, prop, tick, value, duration, ease);

                } else {

                    passed = false;

                }
            }
        }

        var px = !opacity ? "px" : 0,
            constant = value - tick,
            range = tick < value,
            then = Date.now(),
            begin = tick,
            timed = 0,
            finish,
            pTick,
            now;

        finish = value + px;

        if (prop === "opacity") {

            (range) ? value -= 0.025 : value += 0.025;

        } else {
            (range) ? value -= 0.25 : value += 0.25;
        }

        function trans() {

            now = hAzzle.now();
            timed += now - then;
            tick = ease(timed, begin, constant, duration);
            then = now;

            if (!opacity) {

                tick = range ? (tick + 0.5) | 0 : (tick - 0.5) | 0;
            }

            if (tick === pTick) return true;

            if (range) {

                if (tick >= value) {

                    hAzzle.style(obj, prop, finish);
                    return false;

                }

            } else {

                if (tick <= value) {

                    hAzzle.style(obj, prop, finish);
                    return false;
                }

            }

            pTick = tick;
            hAzzle.style(obj, prop, tick + px);
            return true;

        }

        function cancelled() {

            return false;

        }

        if (passed) {

            trans.stored = [prop, finish];
            return trans;

        } else {

            cancelled.stored = [prop, finish];
            return cancelled;

        }
    },
	
	/**
	 * Background animation
	 */

	bgPosition: function(obj, prop, value, duration, ease) {
		
		var style = obj.style,
		val = style[prop],
		then = hAzzle.now(),
		passed = true,
		timed = 0, 
		finalX,
		finalY,
		finish,
		prevX,
		prevY,
		hasX,
		hasY,
		difX,
		difY,
		tick, 
		now,
		xx,
		yy,
		x, 
		y;

   /**
    * WORK IN PROGRESSS
	*
	*/
      //tick = curCSS(obj, prop);		
			tick = (val !== "") ? val.split(" ") : compute(obj, null).backgroundPosition.split(" ");
			
			x = tick[0];
			y = tick[1];
		
		if(x.search("%") !== -1) {
				
			if(x !== "0%") passed = false;
			
		}
		
		if(y.search("%") !== -1) {
				
			if(y !== "0%") passed = false;
			
		}
		
		x = parseInt(x, 10);
		y = parseInt(y, 10);
		
		if(value.hasOwnProperty("x")) {
			
			xx = value.x;
			hasX = true;
			
		}
		else {
		
			xx = x;
			hasX = false;
			
		}
		
		if(value.hasOwnProperty("y")) {
			
			yy = value.y;
			hasY = true;
			
		}
		else {
		
			yy = y;
			hasY = false;
			
		}

		hasX = hasX && x !== xx;
		hasY = hasY && y !== yy;
		if(!hasX && !hasY) passed = false;
		
		difX = xx - x;
		difY = yy - y; 
		finalX = xx + "px";
		finalY = yy + "px";
		finish = finalX + " " + finalY;
		
		function trans() {
					
			now = hAzzle.now();
			timed += now - then;
			then = now;
			
			tick = ease(timed, 0, 1, duration);
			
			if(tick < 0.99) {
				
				if(hasX) {
					
					xx = ((x + (difX * tick)) + 0.5) | 0;
					
				}
				
				if(hasY) {
					
					yy = ((y + (difY * tick)) + 0.5) | 0;
					
				}
				
				if(xx === prevX && yy === prevY) return true;
				
				prevX = xx;
				prevY = yy; 
				
					style.backgroundPosition = xx + "px" + " " + yy + "px";
				
				return true;
				
			}
			else {
				
					style[prop] = finish;

				return false;
				
			}
			
		}
		
		function cancelled() {
	
			return false;
			
		}
		
		if(passed) {
		
			trans.stored = [prop, finish];
			return trans;
			
		}
		else {
		
			cancelled.stored = [prop, finish];
			return cancelled;	
					
		}
		
	},
	
	
	
	
	
	

    /**
     * Color animation
     **/

    color: function (obj, prop, tick, value, duration, ease) {

        var pound = value.search("#") !== -1 ? "" : "#",
            finish = pound + value,
            then = hAzzle.now(),
            style = obj.style,
            passed = false,
            starts = [],
            ends = [],
            timed = 0,
            i = -1,
            now,
            clr,
            st;

        if (tick.search("rgb") !== -1) {

            i = -1;
            starts = tick.split("(")[1].split(")")[0].split(",");
            while (++i < 3) starts[i] = parseInt(starts[i], 10);

        } else {

            starts = getColor(tick);

        }

        ends = getColor(value);
        i = -1;

        while (++i < 3) {

            if (starts[i] !== ends[i]) passed = true;

        }

        function trans() {

            now = hAzzle.now();
            timed += now - then;
            then = now;

            tick = ease(timed, 0, 1, duration);

            if (tick < 0.99) {

                i = -1;
                st = "rgb(";

                while (++i < 3) {

                    clr = starts[i];
                    st += (clr + tick * (ends[i] - clr)) | 0;
                    if (i < 2) st += ",";

                }

                style[prop] = st + ")";
                return true;

            } else {

                style[prop] = finish;
                return false;

            }

        }

        function cancelled() {

            return false;

        }

        if (passed) {

            trans.stored = [prop, finish];
            return trans;

        } else {

            cancelled.stored = [prop, finish];
            return cancelled;

        }

    },

    /**
     * Stop current animation
     **/

    stop: function (complete, callback, popped) {


        var element = this.obj;

        if (!element) {

            clearTimeout(this.delayed);

            this.runner(true);
            this.stop(complete, callback);

            return;

        }

        hAzzle.removeData(element, 'cj');

        if (complete) {

            var group = this.transitions,
                i = group.length,
                ar, prop;

            while (i--) {

                ar = group[i].stored;
                prop = ar[0];


                element.style[prop] = ar[1];
            }
        }

        checkElement(element);
        if (callback) callback = this.complete;
        if (!popped) popTween(this, element, callback, this.completeParams);

    }

};




hAzzle.fn.extend({

    // FIXME!! We don't have a queue, so we need to stop the animation every time.
    //         Todo - Add animation queue. KF

    animate: function (to, settings) {
        return this.stop().each(function () {
            new Tween(this, to, settings || {});
            return this;
        });
    },
	
    /**
     *  FadeIn an element
     *
     */
	

    fadeIn: function (settings) {

        if (!settings) settings = {};

        settings.fadeIn = true;

        this.animate({
            opacity: 1
        }, settings);

    },

    /**
     *  FadeOut an element
     *
     */

    fadeOut: function (settings) {

        if (!settings) settings = {};

        settings.fadeOut = true;

        this.animate({
            opacity: 0
        }, settings);

    },

    /**
     *  Stop all running aniamtions on an object
     **/

    stop: function (complete, callback) {
        return this.each(function () {
            var dcj = hAzzle.data(this, "cj");
            
           if (dcj) {
			// CSS transformation
			if(dcj.transactive) {
				return dcj.stop(callback);
			}
			else {
				return dcj.stop(complete, callback);
				
			}
		}

        });
    }

});


hAzzle.extend({
	
	/**
	 * Used *ONLY* if we are dealing with CSS transformation (not supported in IE9)
	 * If CSS transform antimation plugin are added, set 'transactive' to true
	 */
	
	transactive : false,

    easing: {
        'easeInQuad': function (t, b, c, d) {
            return c * (t /= d) * t + b;
        },
        'easeOutQuad': function (t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        },
        'easeInOutQuad': function (t, b, c, d) {
            return ((t /= d / 2) < 1) ? c / 2 * t * t + b : -c / 2 * ((--t) * (t - 2) - 1) + b;
        },
        easeInCubic: function (t, b, c, d) {
            return c * (t /= d) * t * t + b;
        },
        easeOutCubic: function (t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        },
        easeInOutCubic: function (t, b, c, d) {
            return ((t /= d / 2) < 1) ? c / 2 * t * t * t + b : c / 2 * ((t -= 2) * t * t + 2) + b;
        },
        easeInQuart: function (t, b, c, d) {
            return c * (t /= d) * t * t * t + b;
        },
        easeOutQuart: function (t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        },
        easeInOutQuart: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        },
        easeInQuint: function (t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        },
        easeOutQuint: function (t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        },
        easeInOutQuint: function (t, b, c, d) {
            return ((t /= d / 2) < 1) ? c / 2 * t * t * t * t * t + b : c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
        },
        easeInSine: function (t, b, c, d) {
            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
        },
        easeOutSine: function (t, b, c, d) {
            return c * Math.sin(t / d * (Math.PI / 2)) + b;
        },
        easeInOutSine: function (t, b, c, d) {
            return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
        },
        easeInExpo: function (t, b, c, d) {
            return (t === 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
        },
        easeOutExpo: function (t, b, c, d) {
            return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
        },
        easeInOutExpo: function (t, b, c, d) {
            if (t === 0) return b;
            if (t === d) return b + c;
            if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;

            return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
        },
        easeInCirc: function (t, b, c, d) {
            return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
        },
        easeOutCirc: function (t, b, c, d) {
            return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
        },
        easeInOutCirc: function (t, b, c, d) {
            return ((t /= d / 2) < 1) ? -c / 2 * (Math.sqrt(1 - t * t) - 1) + b : c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
        },
        easeInElastic: function (t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t === 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (a < Math.abs(c)) {
                a = c;
                s = p / 4;
            } else s = p / (2 * Math.PI) * Math.asin(c / a);
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        },
        easeOutElastic: function (t, b, c, d) {
            var s = 1.70158,
                p = 0,
                a = c;
            if (t === 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
        },
        easeInOutElastic: function (t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t === 0) return b;
            if ((t /= d / 2) == 2) return b + c;
            if (!p) p = d * (.3 * 1.5);
            if (a < Math.abs(c)) {
                a = c;
                s = p / 4;
            } else s = p / (2 * Math.PI) * Math.asin(c / a);
            if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
        },
        easeInBack: function (t, b, c, d, s) {
            if (s === undefined) s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },

        easeOutBack: function (t, b, c, d, s) {
            if (s === undefined) s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        easeInOutBack: function (t, b, c, d, s) {
            if (s === undefined) s = 1.70158;
            if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
        },
        easeOutBounce: function (t, b, c, d) {
            if ((t /= d) < (1 / 2.75)) {
                return c * (7.5625 * t * t) + b;
            } else if (t < (2 / 2.75)) {
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
            } else if (t < (2.5 / 2.75)) {
                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
            } else {
                return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
            }
        }

    },
	
	stop: function(obj, complete, callback) {
		
            var dcj = hAzzle.data(obj, "cj");
            
			// CSS transformation are running

			if(!dcj.transactive) {
				return dcj.stop(complete, callback);
			}
			else {
				return dcj.stop(callback);
			}
			
	},

    stopAll: function (complete) {
         
		 if(cancel) {

			 cancel(engine);
			 
		 } else {
			 
			 clearInterval(timer);
		 }
			var i = dictionary.length, itm;
			length = 0;
			
			while(i--) {
				
				itm = dictionary[i];
				
				if(!itm.transactive) {
					
					itm.stop(complete, false, true, true);
					
				}
				else {
					
					itm.stop(false, true);
				}
			}
			
			dictionary = [];
			engineRunning = false;
			itm = trans = null;
    },

    /**
     * Set the default easing function
     */

    setEase: function (easing) {
        defaultEase = easing;
    },

    /**
     * Set default duration
     */

    setDuration: function (num) {
        defaultDuration = num;
    }


});


// if CSS3 fadeIn/fadeOut gets aborted, restore the properties
function checkElement(element) {

    if (hAzzle.data(element, 'fadeIn')) {
        hAzzle.removeData(element, 'fadeIn');
        element.style.opacity = 1;
        element.style.visibility = "visible";

    } else if (hAzzle.data(element, 'fadeOut')) {
        hAzzle.removeData(element, 'fadeOut');
        element.style.display = "none";
    }
}


/**
 * Checks to make sure the timeline engine starts
 */

function checkEngine() {
    if (!engineRunning) engine();
}

/**
 * Removes the tween from memory when finished
 */

function popTween($this, element, callback, params) {

    dictionary.splice(dictionary.indexOf($this), 1);
    length = dictionary.length;

    if (callback) callback(element, params);

}


// parse hex color
// credit: http://www.bitstorm.org/jquery/color-animation/
function getColor(color) {

    var matched;

    if (matched = color1.exec(color)) {

        return [parseInt(matched[1], 16), parseInt(matched[2], 16), parseInt(matched[3], 16), 1];

    } else if (matched = color2.exec(color)) {

        return [parseInt(matched[1], 16) * 17, parseInt(matched[2], 16) * 17, parseInt(matched[3], 16) * 17, 1];

    }

}