var VoxBinder = (function() {
    var self = {};

    self._mapping = {};

    self._typeDef = {
        'int': function(val) { return parseInt(val); },
        'float': function(val) { return parseFloat(val); },
        'currency': function(val) { return Vox.toFormattedCurrency(val); },
        'string': function(val) { return val.toString(); },
    };

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
                val = Vox.binder.castValue(attrType, val);
                element[valueDOM] = val;
                Vox.binder._mapping[path] = val;
            }
        });
    };

    self.castValue = function(attrType, value) {
        if (attrType == null) return value;

        attrType = attrType.toLowerCase();
        if (typeof self._typeDef[attrType] !== 'undefined') {
            return self._typeDef[attrType](value);
        }
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
                element[elementDef.valueDOM] = val;
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