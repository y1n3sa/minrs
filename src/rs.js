var RS = {};

RS.Slider = (function () {

    var settings = {
        C_LEFT          : 'left',
        C_MIDDLE        : 'middle',
        C_RIGHT         : 'right',
        C_CONTAINER     : 'range-slider-container',
        C_DUAL          : 'dual',
        C_CONTROLLER    : 'controller'
    };

    var defaultOptions = {
        dual        : false,
        max         : 400,
        min         : 0,
        currentMin  : 0,
        currentMax  : 0
    };

    var flexPatterns = [
        { attr: 'flex', pattern: '{0} 1 auto' }
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
    
    var calculateFlexes = function (min, max, currentMin, currentMax, unit, dual) {
        var flexes = [];
        if (dual) {
            flexes.push((currentMin - min) * unit);
            if (dual) {
                flexes.push((currentMax - currentMin) * unit);
            }
            flexes.push((max - currentMax) * unit);
        } else {
            flexes.push((currentMax - currentMin) * unit);
            flexes.push((max - currentMax) * unit);
        }
        return flexes;
    };

    var calculateUnit = function (min, max, internalMin, internalMax) {
        return (internalMax - internalMin) / (max - min);
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

    return function (elementId, options) {
        var that = this;

        options = normalizeOptions(options);

        var internalMin = 0, internalMax = 100;
        var currentMin = options.currentMin;
        var currentMax = options.currentMax;

        var unit = calculateUnit(options.min, options.max, internalMin, internalMax);

        this.element = document.getElementById(elementId);
        this.element.className += settings.C_CONTAINER;

        var divisions = createDivisions(options.dual);

        for(var i=0; i < divisions.length; i++) {
            this.element.appendChild(divisions[i]);
        }

        var dragging = false;

        var bindMouseDown = function (element, isMin) {
            element.onmousedown = function (e) {
                dragging = true;
                !e && (e = window.event);
                var targetElement = e.target ? e.target : e.srcElement;
                if (targetElement.className == settings.C_CONTROLLER) {
                    bindMouseMove(targetElement, isMin);
                }
                return false;
            }.bind(this);
        }.bind(this);


        if (options.dual) {
            this.minController = createController();
            this.minController.left = -16;
            this.element.appendChild(this.minController);
            bindMouseDown(this.minController, true);
        }

        
        this.maxController = createController();
        this.maxController.left = -16;
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
                        element.left = v.clientX - this.left - 16;
                        element.style.left = element.left + 'px';
                        dragUpdate(element.left + 16, isMin);
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
            var flexes = calculateFlexes(options.min, options.max, currentMin, currentMax,
                unit, options.dual);
            for(var i=0; i < divisions.length; i++) {
                updateFlex(divisions[i], flexes[i]);
            }
        };

        var dragUpdate = function (value, isMin) {
            var dragUnit = (options.max - options.min) / (that.right - that.left);
            console.log(isMin + ' ' + dragUnit + ' ' + value);
            if (isMin) {
                that.updateMin(dragUnit * value);
            } else {
                that.updateMax(dragUnit * value);
            }
        };

        this.updateMin = function (value) {
            value = parseInt(value);
            currentMin = value;
            currentMax = value > currentMax ? value : currentMax;
            updateFlexes();
        };

        this.updateMax = function (value) {
            value = parseInt(value);
            value = currentMin > value ? currentMin : value;
            currentMax = value;
            updateFlexes();
        };

        this.left = this.element.offsetLeft;
        this.right = this.element.clientWidth + this.left;
    };

})();