var MINRS = {};

(function () {
    if (document.registerElement) {
        MINRS.minrsElement = document.registerElement('min-rs');
    }
})();

MINRS.Listener = (function () {
    ///Find all min-rs html elements and create objects
    window.addEventListener("load", function () {
        var elements = document.getElementsByTagName("min-rs");
        for(var i=0; i < elements.length; i++) {
            var element = elements.item(i);
            var opts = JSON.parse(element.getAttribute("options"));
            new MINRS.Slider(element, opts);
        }
    });
})();

MINRS.Slider = (function () {

    var settings = {
        LEFT        : 'left',
        MID         : 'middle',
        RIGHT       : 'right',
        CONT        : 'range-slider-container',
        DUAL        : 'dual',
        CONTR       : 'controller',
        CONTR_IN    : 'inner',
        CONTR_L     : -16,
        RULER       : 'range-slider-ruler',
        RULER_LC    : 5
    };

    var defaultOptions = {
        dual        : false,
        end         : 400,
        start       : 0,
        min         : 0,
        max         : 0,
        ruler       : false
    };

    var flexValue = '{0} 1 auto';

    var flexPatterns = [
        { attr: 'flex',         pattern: flexValue },
        { attr: '-webkit-flex', pattern: flexValue },
        { attr: '-ms-flex',     pattern: flexValue }
    ];

    var isUndefined = function (val) {
        return typeof val === 'undefined';
    };

    ///Fills the undefined properties of the options provided
    var normalizeOptions = function (options) {
        if (!options) {
            return defaultOptions;
        } else {
            var normalized = {};
            Object.getOwnPropertyNames(defaultOptions).forEach(function (prop) {
                normalized[prop] = isUndefined(options[prop]) ?
                    defaultOptions[prop] : options[prop];
            });
            if (!normalized.dual) {
                normalized.max = defaultOptions.max;
            }
            if (normalized.min < normalized.start) {
                normalized.min = normalized.start;
            }
            if (normalized.max < normalized.start) {
                normalized.max = normalized.start;
            }
            return normalized;
        }
    };

    ///calculates flex values
    var calculateFlexes = function (start, end, min, max, unit, dual) {
        var flexes = [];
        if (dual) {
            flexes.push((min - start) * unit);
            if (dual) {
                flexes.push((max - min) * unit);
            }
            flexes.push((end - max) * unit);
        } else {
            flexes.push((max - min) * unit);
            flexes.push((end - max) * unit);
        }
        return flexes;
    };

    ///Proportional value
    var calculateUnit = function (start, end, internalMin, internalMax) {
        return (internalMax - internalMin) / (end - start);
    };

    ///Creates the left flex
    var createLeftElement = function (dual) {
        var leftElement = document.createElement("div");
        leftElement.className += settings.LEFT;
        if (dual) {
            leftElement.className += ' ' + settings.DUAL;
        }
        return leftElement;
    };

    ///Creates middle flex for dual sliders
    var createMiddleElement = function () {
        var middleElement = document.createElement("div");
        middleElement.className += settings.MID;
        return middleElement;
    };

    ///Creates the right flex
    var createRightElement = function (dual) {
        var rightElement = document.createElement("div");
        rightElement.className += settings.RIGHT;
        if (dual) {
            rightElement.className += ' ' + settings.DUAL;
        }
        return rightElement;
    };

    ///Creates the flex divisons
    var createDivisions = function (dual) {
        var divisions = [];
        divisions.push(createLeftElement(dual));
        if (dual) {
            divisions.push(createMiddleElement());
        }
        divisions.push(createRightElement(dual));
        return divisions;
    };

    ///Controller to change min - max value
    var createController = function () {
        var controllerElement = document.createElement("div");
        controllerElement.className += settings.CONTR;
        var innerElement = document.createElement("div");
        innerElement.className += settings.CONTR_IN;
        controllerElement.appendChild(innerElement);
        return controllerElement;
    };

    ///String format function
    var format = function () {
        var args = Array.prototype.slice.call(arguments);
        var pattern = args[0];
        for(var i=1; i < args.length; i++) {
            pattern = pattern.replace(new RegExp("\\{" + (i- 1) + "\\}"), args[i]);
        }
        return pattern;
    };

    ///Calculates the ruler values and creates the ruler element with these
    var createRuler = function (start, end) {
        var diff = (end - start) / 4;
        var rulerElement = document.createElement("ul");
        for(var i=0; i < settings.RULER_LC; i++) {
            var value = i == 0 ? start : (i == settings.RULER_LC - 1 ? end :
                parseInt(i * diff) + start);
            var rulerLine = document.createElement("li");
            var spanElement = document.createElement("span");
            spanElement.innerHTML = value;
            rulerLine.appendChild(spanElement);
            rulerElement.appendChild(rulerLine);
        }
        rulerElement.className += settings.RULER;
        return rulerElement;
    };

    ///Tries to center the ruler value text
    var adjustRulerTextWidth = function (rulerElement) {
        var liElements = rulerElement.childNodes;
        if (!liElements.forEach) {
            liElements = Array.prototype.slice.call(rulerElement.childNodes);
        }
        liElements.forEach(function (li) {
            var span = li.childNodes[0];
            var left = span.offsetWidth / 2;
            span.style.marginLeft = (-1 * left) + 'px';
        });
    };

    return function (el, options) {
        var that = this;

        options = normalizeOptions(options);

        this.getEndValue = function () {
            return options.end;
        };

        this.getStartValue = function () {
            return options.start;
        };

        var setMin = function (value) {
            if (isUndefined(value)) {
                return options.min;
            }
            if (value < options.start) {
                value = options.start;
            }
            if (value <= max && value >= options.start) {
                min = value;
            }
            if (min > max) {
                min = max;
            }
            return min;
        };

        var setMax = function (value) {
            if (isUndefined(value)) {
                return options.max;
            }
            if (value > options.end) {
                value = options.end;
            }
            if(value <= options.end && value >= min) {
                max = value;
            }
            if (max > options.end) {
                max = options.end;
            }
            return max;
        };

        var internalMin = 0, internalMax = 100;
        var min = options.start;
        var max = options.start;
        min = setMin();
        max = setMax();

        var unit = calculateUnit(options.start, options.end, internalMin, internalMax);

        this.element = document.getElementById(el) || el;
        this.element.className += settings.CONT;

        var divisions = createDivisions(options.dual);

        for(var i=0; i < divisions.length; i++) {
            this.element.appendChild(divisions[i]);
        }

        if (options.ruler) {
            var rulerElement = createRuler(options.start, options.end);
            this.element.parentElement.insertBefore(rulerElement, null);
            adjustRulerTextWidth(rulerElement);
        }

        var dragging = false;

        ///bind the mouse down event to track dragging of the controller
        var bindMouseDown = function (element, isMin) {
            element.onmousedown = function (e) {
                !e && (e = window.event);
                var targetElement = e.target ? e.target : e.srcElement;
                if (targetElement.className == settings.CONTR) {
                    dragging = true;
                    bindMouseMove(targetElement, isMin);
                } else if(targetElement.className == settings.CONTR_IN) {
                    dragging = true;
                    bindMouseMove(targetElement.parentElement, isMin);
                }
                return false;
            }.bind(this);
        }.bind(this);


        if (options.dual) {
            this.minController = createController();
            this.minController.left = settings.CONTR_L;
            this.element.appendChild(this.minController);
            bindMouseDown(this.minController, true);
        }

        
        this.maxController = createController();
        this.maxController.left = settings.CONTR_L;
        this.element.appendChild(this.maxController);
        bindMouseDown(this.maxController);

        this.element.onmouseup = function (e) {
            this.maxController.onmousemove = null;
            if (this.minController) {
                this.minController.onmousemove = null;
            }
            dragging = false;
        }.bind(this);

        var bindMouseMove = function (element, isMin) {
            if (element.onmousemove) {
                return;
            }
            element.onmousemove = function (v) {
                if (dragging) {
                    !v && (v = window.event);
                    if (v.clientX >= this.left && v.clientX <= this.right) {
                        element.left = v.clientX - this.left + settings.CONTR_L;
                        element.style.left = element.left + 'px';
                        dragUpdate(element.left - settings.CONTR_L, isMin);
                    }
                }
            }.bind(this);
        }.bind(this);

        var updateFlex = function (element, value) {
            flexPatterns.forEach(function (fp) {
                element.style[fp.attr] = format(fp.pattern, value);
            });
        };

        var updateFlexes = function () {
            var flexes = calculateFlexes(options.start, options.end, min, max,
                unit, options.dual);
            for(var i=0; i < divisions.length; i++) {
                updateFlex(divisions[i], flexes[i]);
            }
        };

        var relocateMaxController = function () {
            if (that.maxController) {
                that.maxController.left = (((max - options.start) / (options.end - options.start)) * that.element.offsetWidth) + settings.CONTR_L;
                that.maxController.style.left = that.maxController.left + 'px';
            }
        };

        var relocateMinController = function () {
            if (that.minController) {
                that.minController.left = (((min - options.start) / (options.end - options.start)) * that.element.offsetWidth) + settings.CONTR_L;
                that.minController.style.left = that.minController.left + 'px';
            }
        };

        var dragUpdate = function (value, isMin) {
            var dragUnit = (options.end - options.start) / (that.right - that.left);
            if (isMin) {
                updateMinCheckInternal((dragUnit * value) + options.start, true);
            } else {
                updateMaxCheckInternal((dragUnit * value) + options.start, true);
            }
        };

        ///Updates the minimum value, and if the trigger is not internal, relocates the controller
        var updateMinCheckInternal = function (value, internal) {
            value = parseInt(value);
            min = setMin(value);
            updateFlexes();
            if (!internal && options.dual) {
                relocateMinController();
            }
        };

        ///Updates the maximum value, and if the trigger is not internal, relocates the controller
        var updateMaxCheckInternal = function (value, internal) {
            value = parseInt(value);
            max = setMax(value);
            updateFlexes();
            if (!internal) {
                relocateMaxController();
            }
        };

        window.addEventListener("resize", function () {
            that.left = that.element.offsetLeft;
            that.right = that.element.clientWidth + that.left;
            relocateMinController();
            relocateMaxController();
        });

        this.updateMin = function (value) {
            updateMinCheckInternal(value);
        };

        this.updateMax = function (value) {
            updateMaxCheckInternal(value);
        };

        this.getMin = function () {
            return min;
        };

        this.getMax = function () {
            return max;
        };

        this.left = this.element.offsetLeft;
        this.right = this.element.clientWidth + this.left;

        if (options.dual) {
            updateMaxCheckInternal(options.max, false);
        }
        updateMinCheckInternal(options.min, false);
    };

})();