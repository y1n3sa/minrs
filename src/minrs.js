var MINRS = {};
/// fix me /// window.resize
/// fix me /// after update function invoked, relocate controllers

MINRS.Slider = (function () {

    var settings = {
        C_LEFT              : 'left',
        C_MIDDLE            : 'middle',
        C_RIGHT             : 'right',
        C_CONTAINER         : 'range-slider-container',
        C_DUAL              : 'dual',
        C_CONTROLLER        : 'controller',
        C_CONTROLLER_INNER  : 'inner',
        CONTROLLER_LEFT     : -16,
        C_RULER             : 'range-slider-ruler',
        RULER_LINE_COUNT    : 5
    };

    var defaultOptions = {
        dual        : false,
        end         : 400,
        start       : 0,
        min         : 0,
        max         : 0,
        ruler       : false
    };

    var flexPatterns = [
        { attr: 'flex',         pattern: '{0} 1 auto' },
        { attr: '-webkit-flex', pattern: '{0} 1 auto' },
        { attr: '-ms-flex',     pattern: '{0} 1 auto' }
    ];

    var normalizeOptions = function (options) {
        if (!options) {
            return defaultOptions;
        } else {
            var normalized = {};
            Object.getOwnPropertyNames(defaultOptions).forEach(function (prop) {
                normalized[prop] = typeof options[prop] === 'undefined' ?
                    defaultOptions[prop] : options[prop];
            });
            return normalized;
        }
    };
    
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

    var calculateUnit = function (start, end, internalMin, internalMax) {
        return (internalMax - internalMin) / (end - start);
    };

    var createDivisions = function (dual) {
        var divisions = [];
        var leftElement = document.createElement("div");
        leftElement.className += settings.C_LEFT;
        divisions.push(leftElement);
        var rightElement = document.createElement("div");
        rightElement.className += settings.C_RIGHT;
        if (dual) {
            leftElement.className += ' ' + settings.C_DUAL;
            var middleElement = document.createElement("div");
            middleElement.className += settings.C_MIDDLE;
            divisions.push(middleElement);
            rightElement.className += ' ' + settings.C_DUAL;
        }
        divisions.push(rightElement);
        return divisions;
    };

    var createController = function () {
        var controllerElement = document.createElement("div");
        controllerElement.className += settings.C_CONTROLLER;
        var innerElement = document.createElement("div");
        innerElement.className += settings.C_CONTROLLER_INNER;
        controllerElement.appendChild(innerElement);
        return controllerElement;
    };

    var format = function () {
        var args = Array.prototype.slice.call(arguments);
        var pattern = args[0];
        for(var i=1; i < args.length; i++) {
            pattern = pattern.replace(new RegExp("\\{" + (i- 1) + "\\}"), args[i]);
        }
        return pattern;
    };

    var createRuler = function (start, end) {
        var diff = (end - start) / 4;
        var rulerElement = document.createElement("ul");
        for(var i=0; i < settings.RULER_LINE_COUNT; i++) {
            var value = i == 0 ? start : (i == settings.RULER_LINE_COUNT - 1 ? end :
                parseInt(i * diff));
            var rulerLine = document.createElement("li");
            var spanElement = document.createElement("span");
            spanElement.innerHTML = value;
            rulerLine.appendChild(spanElement);
            rulerElement.appendChild(rulerLine);
        }
        rulerElement.className += settings.C_RULER;
        return rulerElement;
    };

    var adjustRulerTextWidth = function (rulerElement) {
        rulerElement.childNodes.forEach(function (li) {
            var span = li.childNodes[0];
            var left = span.offsetWidth / 2;
            span.style.marginLeft = (-1 * left) + 'px';
        });
    };

    return function (elementId, options) {
        var that = this;

        options = normalizeOptions(options);

        this.getEndValue = function () {
            return options.end;
        };

        this.getStartValue = function () {
            return options.start;
        };

        var setMin = function (value) {
            value = value || options.min;
            value = value < options.start ? options.start : value;
            if (!options.dual) {
                min = options.start;
            } else {
                if (value <= max && value >= options.start) {
                    min = value;
                }
            }
            return min;
        };

        var setMax = function (value) {
            value = value || options.max;
            value = value > options.end ? options.end : value;
            if(value <= options.end && value >= min) {
                max = value;
            }
            return max;
        };

        var internalMin = 0, internalMax = 100;
        var min = options.start;
        var max = options.end;
        min = setMin();
        max = setMax();

        var unit = calculateUnit(options.start, options.end, internalMin, internalMax);

        this.element = document.getElementById(elementId);
        this.element.className += settings.C_CONTAINER;

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

        var bindMouseDown = function (element, isMin) {
            element.onmousedown = function (e) {
                !e && (e = window.event);
                var targetElement = e.target ? e.target : e.srcElement;
                if (targetElement.className == settings.C_CONTROLLER) {
                    dragging = true;
                    bindMouseMove(targetElement, isMin);
                } else if(targetElement.className == settings.C_CONTROLLER_INNER) {
                    dragging = true;
                    bindMouseMove(targetElement.parentElement, isMin);
                }
                return false;
            }.bind(this);
        }.bind(this);


        if (options.dual) {
            this.minController = createController();
            this.minController.left = settings.CONTROLLER_LEFT;
            this.element.appendChild(this.minController);
            bindMouseDown(this.minController, true);
        }

        
        this.maxController = createController();
        this.maxController.left = settings.CONTROLLER_LEFT;
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
                        element.left = v.clientX - this.left + settings.CONTROLLER_LEFT;
                        element.style.left = element.left + 'px';
                        dragUpdate(element.left - settings.CONTROLLER_LEFT, isMin);
                    }
                }
            }.bind(this);
        }.bind(this);

        updateFlex = function (element, value) {
            flexPatterns.forEach(function (fp) {
                element.style[fp.attr] = format(fp.pattern, value);
            });
        };

        updateFlexes = function () {
            var flexes = calculateFlexes(options.start, options.end, min, max,
                unit, options.dual);
            for(var i=0; i < divisions.length; i++) {
                updateFlex(divisions[i], flexes[i]);
            }
        };

        var dragUpdate = function (value, isMin) {
            var dragUnit = (options.end - options.start) / (that.right - that.left);
            if (isMin) {
                that.updateMin(dragUnit * value);
            } else {
                that.updateMax(dragUnit * value);
            }
        };

        this.updateMin = function (value) {
            value = parseInt(value);
            min = setMin(value);
            updateFlexes();
        };

        this.updateMax = function (value) {
            value = parseInt(value);
            max = setMax(value);
            updateFlexes();
        };

        this.getMin = function () {
            return min;
        };

        this.getMax = function () {
            return max;
        };

        this.left = this.element.offsetLeft;
        this.right = this.element.clientWidth + this.left;
    };

})();