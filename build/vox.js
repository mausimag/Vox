var VoxBinder = (function() {
    var self = {};
    self.mapping = {};

    self.getAllBindedElements = function() {
        var elements = [];
        var all = document.getElementsByTagName('*');
        for (var i = 0; i < all.length; i++) {
            if (all[i].getAttribute(Vox.attrBind) !== null)
                elements.push(all[i]);
        }
        return elements;
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

    self.bindGetterSetter = function(obj, prop, path, element) {
        if (typeof obj === 'undefined') {
            return false;
        }
        var _index = prop.indexOf('.')
        if (_index > -1) {
            return self.bindGetterSetter(obj[prop.substring(0, _index)], prop.substr(_index + 1), path, element);
        }

        Object.defineProperty(obj, prop, {
            get: function() {
                return self.mapping[path]
            },
            set: function(val) {
                element.value = val;
                self.mapping[path] = val;
            }
        });
    };

    self.bindElement = function(element, attrs) {
        var _path = element.getAttribute(Vox.attrBind);
        var path = _path.split(/[\.\[\]\"\']{1,2}/);
        var objectName = path.shift();
        var object = self.ctx[objectName];

        var value = self.elementValue(object, path.join('.'));
        self.mapping[_path] = value;
        self.bindGetterSetter(object, path.join('.'), _path, element)

        var tagName = element.tagName.toLowerCase();
        var typeName = element.type.toLowerCase();

        // bind event
        var valueDOM = "";
        var eventType = "";

        if (tagName == 'input' || tagName == 'textarea') {
            if (typeName == 'text' || typeName == 'textarea') {
                valueDOM = "value";
                eventType = "keyup";
            } else if (typeName == 'checkbox') {
                valueDOM = "checked";
                eventType = "change";
            }
        } else if (tagName == 'select') {
            valueDOM = "value";
            eventType = "change";
        }

        if (valueDOM !== "" && eventType !== "") {
            element[valueDOM] = value;
            element.addEventListener(eventType, function() {
                var val = element[valueDOM];
                var attrType = element.getAttribute(Vox.attrValueType);
                if (attrType) {
                    switch (attrType.toLowerCase()) {
                        case 'int':
                            val = parseInt(val);
                            break;
                        case 'float':
                            val = parseFloat(val);
                            break;
                        case 'string':
                        default:
                            val = val.toString();
                    }
                }
                self.mapping[_path] = val;
            }, false);
        }
    };

    self.init = function(context) {
        if (context == null) {
            self.ctx = window;
        }
        var elements = self.getAllBindedElements();
        for (var i = 0; i < elements.length; i++) {
            var attrs = elements[i].getAttribute(Vox.attrBind).split('.');
            self.bindElement(elements[i], attrs)
        }
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

    self.getVoxdElements = function() {
        var elements = self.ctx.document.getElementsByTagName('*');
        self.invalids = [];

        Vox.forEach(elements, function(e) {
            if (e.getAttribute(Vox.attrPattern)) {
                self.invalids.push(e)
            }

            var val = e.getAttribute(Vox.attrRequired);
            if (val == 'true') {
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
            var tagName = e.tagName.toLowerCase();
            if (tagName == 'input' || tagName == 'textarea') {
                var value = e.value.trim();
                var isRequired = e.getAttribute(Vox.attrRequired);
                var pattern = e.getAttribute(Vox.attrPattern);
                var regex = (!isRequired) ? pattern : "^.{0}$";

                if (self.validateRegex(value, regex) == true) {
                    var r = { 'element': e };
                    r.message = e.getAttribute(Vox.attrInvalidMessage);
                    result.push(r);
                }
            }
        });
        return result;
    };

    self.validateAll = function(cb) {
        self.getVoxdElements();
        cb(self.validateRequired())
    };

    return self;
})();
var Vox = (function() {
    var self = {};
    self.ctx = null;

    self.binder = VoxBinder;
    self.attrBind = 'vox-bind';
    self.attrValueType = 'vox-value-type';

    self.validation = VoxValidation;
    self.attrPattern = 'vox-pattern';
    self.attrRequired = 'vox-required';
    self.attrInvalidMessage = 'vox-message';

    self.bootstrap = function() {}

    self.forEach = function(arr, cb) {
        var len = arr.length;
        for (var i = 0; i < len; i++) {
            cb(arr[i], i, arr);
        }
    };

    return self;
})();