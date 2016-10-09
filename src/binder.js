var VoxBinder = (function() {
    var self = {};

    self.mapping = {
        arr: {}
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

    // table binder
    (function() {
        var _push = Array.prototype.push;
        Array.prototype.push = function() {
            ins = _push.apply(this, arguments);
            if (this._vox_observe) {
                var tableId = this._vox_observe;
                var values = this._vox_values;
                Vox.binder.insertRow(this[this.length - 1], tableId, values);
            }
            return ins;
        }
    })();

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

    self.bindTable = function(arr, tableId, values) {
        arr._vox_observe = tableId;
        arr._vox_values = values;

        Vox.forEach(arr, function(e) {
            self.insertRow(e, tableId, values);
        });
    };

    return self;

})();