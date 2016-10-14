var VoxAjax = (function() {
    var self = {};
    var _xhr = null;

    var XMLHttpFactories = [
        function() { return new XMLHttpRequest() },
        function() { return new ActiveXObject("Msxml2.XMLHTTP") },
        function() { return new ActiveXObject("Msxml3.XMLHTTP") },
        function() { return new ActiveXObject("Microsoft.XMLHTTP") }
    ];

    var createXHR = function() {
        var xmlhttp = false;
        var len = XMLHttpFactories.length;
        for (var i = 0; i < len; i++) {
            try {
                xmlhttp = XMLHttpFactories[i]();
            } catch (e) {
                continue;
            }
            break;
        }
        return xmlhttp;
    };

    var parse = function(req) {
        var result;
        try {
            result = JSON.parse(req.responseText);
        } catch (e) {
            result = req.responseText;
        }
        return [result, req];
    };

    self.checkXHR = function() {
        if (_xhr == null)
            _xhr = createXHR();
        return _xhr;
    };

    self.http = function(params) {
        var xhr = self.checkXHR();
        if (!xhr) return;

        var methods = {
            success: function() {},
            error: function() {},
            then: function() {}
        };

        xhr.open(params.method, params.url, true);
        xhr.setRequestHeader('Content-type', params.contentType);
        xhr.onreadystatechange = function() {
            var req;

            if (xhr.readyState === 4) {
                req = parse(xhr);
                if (xhr.status >= 200 && xhr.status < 300) {
                    methods.success.apply(methods, req);
                } else {
                    methods.error.apply(methods, req);
                }
                methods.then.apply(methods, req);
            }
        };

        xhr.send(params.data);

        var xhrResponse = {
            success: function(callback) {
                methods.success = callback;
                return xhrResponse;
            },
            error: function(callback) {
                methods.error = callback;
                return xhrResponse;
            },
            then: function(callback) {
                methods.then = callback;
                return xhrResponse;
            }
        };

        return xhrResponse
    };

    self.post = function(url, data) {
        return self.http({ method: 'POST', url: url, data: data, contentType: 'application/json' })
    };

    self.get = function(url, data) {
        return self.http({ method: 'GET', url: url, data: data, contentType: 'application/json' })
    };

    self.put = function(url, data) {
        return self.http({ method: 'PUT', url: url, data: data, contentType: 'application/json' })
    };

    self.delete = function(url, data) {
        return self.http({ method: 'DELETE', url: url, data: data, contentType: 'application/json' })
    };

    return self;
})();
var VoxBinder = (function() {
    var self = {};

    self._mapping = {};

    self.init = function(context) {
        if (context == null) {
            self.ctx = window;
        }

        self.update();

        self.ctx.addEventListener("DOMNodeInserted", function(event) {
            if (event.srcElement.attributes) {
                if (typeof event.srcElement.attributes[Vox.attrBind] !== 'undefined') {
                    self.bindElement(event.srcElement);
                }
            }
        });
    };

    self.update = function() {
        var elements = Vox.getAllElementsByAttr(Vox.attrBind);
        for (var i = 0; i < elements.length; i++) {
            self.bindElement(elements[i])
        }
    };

    self.bindGetterSetter = function(obj, prop, path, element, valueDOM) {
        if (typeof obj === 'undefined') {
            return false;
        }
        var _index = prop.indexOf('.')
        if (_index > -1) {
            return self.bindGetterSetter(obj[prop.substring(0, _index)], prop.substr(_index + 1), path, element, valueDOM);
        }

        if (typeof obj[prop] === 'undefined') {
            obj[prop] = (typeof element.value === 'undefined' || !element.value) ? "" : element.value;
        }

        Object.defineProperty(obj, prop, {
            get: function() {
                return Vox.binder._mapping[path];
            },
            set: function(val) {
                var attrType = element.getAttribute(Vox.attrValueType);
                console.log(val)
                val = Vox.binder.castValue(attrType, val);
                element[valueDOM] = val;
                Vox.binder._mapping[path] = val;
            }
        });
    };

    self.castValue = function(attrType, value) {
        var typef = Vox._typeDef['string'];
        if (attrType != null) {
            attrType = attrType.toLowerCase();
            if (typeof Vox._typeDef[attrType] !== 'undefined') {
                typef = Vox._typeDef[attrType];
            }
        }

        return typef(value);
        /*var val = value;
        if (attrType) {
            switch (attrType.toLowerCase()) {
                case 'int':
                    val = parseInt(val);
                    break;
                case 'float':
                    val = parseFloat(val);
                    break;
                case 'currency':
                    val = Vox.toFormattedCurrency(val);
                    break;
                case 'string':
                default:
                    val = val.toString();
            }
        }
        return val;*/
    };

    self.bindElement = function(element) {
        var _path = element.getAttribute(Vox.attrBind);
        var path = _path.split(/[\.\[\]\"\']{1,2}/);
        var objectName = path.shift();
        var object = self.ctx[objectName];
        var elementDef = Vox.getElementDef(element);

        var value = Vox.elementValue(object, path.join('.'));
        self._mapping[_path] = value;
        self.bindGetterSetter(object, path.join('.'), _path, element, elementDef.valueDOM)

        // bind event
        if (elementDef != null) {
            // happens when Vox creats a property that not exists
            if (typeof value === 'undefined') {
                value = '';
            }
            element[elementDef.valueDOM] = value;
            element.addEventListener(elementDef.eventType, function() {
                var val = element[elementDef.valueDOM];
                var attrType = element.getAttribute(Vox.attrValueType);
                val = Vox.binder.castValue(attrType, val);
                element.value = val;
                self._mapping[_path] = val;
            }, false);
        }
    };


    /**
     * Table operations
     */

    var _push = Array.prototype.push;
    var _pop = Array.prototype.pop;
    var _splice = Array.prototype.splice;

    Array.prototype.push = function() {
        ins = _push.apply(this, arguments);
        if (this._vox_observe) {
            var tableId = this._vox_observe;
            var values = this._vox_values;
            Vox.binder.insertRow(this[this.length - 1], tableId, values);
        }
        return ins;
    };

    Array.prototype.pop = function() {
        e = _pop.apply(this, arguments);
        if (this._vox_observe) {
            self.removeRow(this._vox_observe);
        }
        return e;
    };

    Array.prototype.splice = function() {
        e = _splice.apply(this, arguments);
        if (this._vox_observe) {
            var count = (arguments.length > 1) ? arguments[1] : 1;
            self.removeRow(this._vox_observe, arguments[0], count);
        }
        return e;
    };

    self.insertRow = function(e, tableId, values) {
        var table = self.ctx.document.getElementById(tableId);
        var rowIdx = table.rows.length;
        var cellLen = values.length;
        var row = table.insertRow(rowIdx);

        for (var i = 0; i < cellLen; i++) {
            var newcell = row.insertCell(i);
            var value = Vox.getValuePath(e, values[i]);
            newcell.innerHTML = value;
        }
    };

    self.removeRow = function(tableId, index, count) {
        var table = self.ctx.document.getElementById(tableId);
        if (!index) {
            table.deleteRow(table.rows.length - 1)
        } else {
            if (count) {
                var pos = index + 1;
                var removed = 0;
                while (removed < count) {
                    table.deleteRow(pos)
                    removed++;
                }
            } else {
                table.deleteRow(index)
            }
        }
    };

    self.bindTable = function(arr, tableId, values) {
        arr._vox_observe = tableId;
        arr._vox_values = values;

        Vox.forEach(arr, function(e) {
            self.insertRow(e, tableId, values);
        });
    };

    return self;

})();
/**
 * From: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
 */
if (!Object.assign) {
    Object.defineProperty(Object, 'assign', {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(target) {
            'use strict';
            if (target === undefined || target === null) {
                throw new TypeError('Cannot convert first argument to object');
            }

            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource === undefined || nextSource === null) {
                    continue;
                }
                nextSource = Object(nextSource);

                var keysArray = Object.keys(Object(nextSource));
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
            return to;
        }
    });
}
var VoxFormula = (function() {
    var self = {};

    self.ctx = {};

    return self;
})();
var VoxLocale = (function() {
    var self = {};
    var _lang = {};

    self.ctx = null;

    self.getLabelValue = function(obj, prop, path) {
        if (typeof obj === 'undefined') {
            return false;
        }
        var _index = prop.indexOf('.')
        if (_index > -1) {
            return self.getLabelValue(obj[prop.substring(0, _index)], prop.substr(_index + 1), path);
        }
        return obj[prop];
    };

    self.setLabel = function(element) {
        var _lblPath = element.getAttribute(Vox.attrLabel);
        var lblPath = _lblPath.split(/[\.\[\]\"\']{1,2}/);
        if (!_lblPath || _lblPath.trim().legth == 0) return;

        var label = self.getLabelValue(_lang.data, lblPath.join('.'), _lblPath);
        var tagName = element.tagName.toLowerCase();

        if (tagName == "input" || tagName == "textarea") {
            element.placeholder = label;
        } else {
            element.innerHTML = label;
        }
    };

    self.update = function() {
        var elements = Vox.getAllElementsByAttr(Vox.attrLabel);
        Vox.forEach(elements, function(e) {
            self.setLabel(e);
        })
    }

    self.setLanguage = function(lang, context) {
        if (context == null) {
            self.ctx = window;
        }
        _lang = lang;
        self.update();
    };

    return self;
})();
var VoxValidation = (function() {
    var self = {};
    self.ctx = null;

    self.invalids = [];

    self.init = function(context) {
        if (context == null) {
            self.ctx = window;
        }
    };

    self.getVoxdElements = function(src) {
        var elements = src.getElementsByTagName('*');
        self.invalids = [];

        Vox.forEach(elements, function(e) {
            if (e.getAttribute(Vox.attrPattern) || e.getAttribute(Vox.attrRequired) == 'true') {
                self.invalids.push(e)
            }
        });
    };

    self.validateRegex = function(value, regex) {
        var re = new RegExp(regex);
        return re.test(value);
    };

    self.validateRequired = function() {
        var result = [];
        Vox.forEach(self.invalids, function(e) {
            var def = Vox.getElementDef(e);
            var value = e[def.valueDOM].trim();
            var regex = (!e.getAttribute(Vox.attrRequired)) ? e.getAttribute(Vox.attrPattern) : "^.{0}$";

            if (self.validateRegex(value, regex) == true) {
                var r = { 'element': e };
                r.message = e.getAttribute(Vox.attrInvalidMessage);
                result.push(r);
            }
        });
        return result;
    };

    self.validateAll = function(src) {
        if (src !== 'undefined') {
            src = window.document;
        }
        self.getVoxdElements(src);
        return self.validateRequired();
    };

    return self;
})();
var Vox = (function() {
    var self = {};
    self.ctx = null;

    // binder
    self.binder = VoxBinder;
    self.attrBind = 'vox-bind';
    self.attrValueType = 'vox-value-type';

    // validation
    self.validation = VoxValidation;
    self.attrPattern = 'vox-pattern';
    self.attrRequired = 'vox-required';
    self.attrInvalidMessage = 'vox-message';

    // ajax
    self.ajax = VoxAjax;

    // locale
    self.locale = VoxLocale;
    self.attrLabel = 'vox-label';

    self.listeners = [];

    self.bootstrap = function() {}

    self.elementDef = {
        input: {
            text: { valueDOM: 'value', eventType: 'keyup' },
            checkbox: { valueDOM: 'checked', eventType: 'change' }
        },
        textarea: { valueDOM: 'value', eventType: 'keyup' },
        select: { valueDOM: 'value', eventType: 'change' }
    };

    self._typeDef = {
        'int': function(val) { return parseInt(val); },
        'float': function(val) { return parseFloat(val); },
        'currency': function(val) { return Vox.toFormattedCurrency(val); },
        'string': function(val) { return val.toString(); },
    };

    self.getElementDef = function(e) {
        var tagName = e.tagName ? e.tagName.toLowerCase() : "input";
        var typeName = e.type ? e.type.toLowerCase() : "text";

        var elementDef = null;
        if (self.elementDef[tagName] !== 'undefined') {
            elementDef = (tagName.indexOf('input') > -1) ? self.elementDef[tagName][typeName] : self.elementDef[tagName];
        }
        return elementDef;
    }

    self.forEach = function(arr, cb) {
        var len = arr.length;
        for (var i = 0; i < len; i++) {
            cb(arr[i], i, arr);
        }
    };

    self.getAllElementsByAttr = function(attrName) {
        var elements = [];
        var all = document.getElementsByTagName('*');
        for (var i = 0; i < all.length; i++) {
            if (all[i].getAttribute(attrName) !== null)
                elements.push(all[i]);
        }
        return elements;
    };

    self.elementValue = function(obj, prop) {
        if (typeof obj === 'undefined') {
            return false;
        }
        var _index = prop.indexOf('.')
        if (_index > -1) {
            return self.elementValue(obj[prop.substring(0, _index)], prop.substr(_index + 1));
        }
        return obj[prop];
    };

    self.getObjectAttr = function(path, obj) {
        if (typeof obj === "undefined" || obj === null) return;
        path = path.split(/[\.\[\]\"\']{1,2}/);
        for (var i = 0, l = path.length; i < l; i++) {
            if (path[i] === "") continue;
            obj = obj[path[i]];
            if (typeof obj === "undefined" || obj === null) return;
        }
        return obj;
    };

    self.getValuePath = function(obj, prop) {
        if (typeof obj === 'undefined') {
            return false;
        }
        var _index = prop.indexOf('.')
        if (_index > -1) {
            return self.getValuePath(obj[prop.substring(0, _index)], prop.substr(_index + 1));
        }
        return obj[prop];
    };

    self.toFormattedCurrency = function(val) {
        val = val.toString();
        var n = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
        var initValue = val;
        var clean = initValue.replace(/\./g, '').replace(/,/g, '').replace(/^0+/, '');

        if (!clean.match(/^([0-9]+$)/g)) {
            return '';
        }

        if (1 == 1) {
            var value = clean;
            if (value.length == 2) value = '0' + value;
            if (value.length == 1) value = '00' + value;

            var strf = '';
            var len = value.length;
            for (var i = 0; i < len; i++) {
                var sep = '';
                if (i == 2) sep = ',';
                if (i > 3 && (i + 1) % 3 == 0) sep = '.';
                strf = value.substring(value.length - 1 - i, value.length - i) + sep + strf;
            }

            initValue = strf;
        }

        return initValue;
    }

    return self;
})();