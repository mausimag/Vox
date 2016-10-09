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
    self.mapping = {};

    self.bindGetterSetter = function(obj, prop, path, element, valueDOM) {
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
                element[valueDOM] = val;
                self.mapping[path] = val;
            }
        });
    };

    self.bindElement = function(element, attrs) {
        var _path = element.getAttribute(Vox.attrBind);
        var path = _path.split(/[\.\[\]\"\']{1,2}/);
        var objectName = path.shift();
        var object = self.ctx[objectName];

        var tagName = element.tagName.toLowerCase();
        var typeName = element.type.toLowerCase();
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


        var value = Vox.elementValue(object, path.join('.'));
        self.mapping[_path] = value;
        self.bindGetterSetter(object, path.join('.'), _path, element, valueDOM)


        // bind event
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
        var elements = Vox.getAllElementsByAttr(Vox.attrBind);
        for (var i = 0; i < elements.length; i++) {
            var attrs = elements[i].getAttribute(Vox.attrBind).split('.');
            self.bindElement(elements[i], attrs)
        }
    };

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

    self.bootstrap = function() {}

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

    return self;
})();