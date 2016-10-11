var VoxBinder = (function() {
    var self = {};

    self.mapping = {};

    self.elementDef = {
        input: {
            text: { valueDOM: 'value', eventType: 'keyup' },
            checkbox: { valueDOM: 'checked', eventType: 'change' }
        },
        textarea: { valueDOM: 'value', eventType: 'keyup' },
        select: { valueDOM: 'value', eventType: 'change' }
    };

    self.init = function(context) {
        if (context == null) {
            self.ctx = window;
        }

        var elements = Vox.getAllElementsByAttr(Vox.attrBind);
        for (var i = 0; i < elements.length; i++) {
            self.bindElement(elements[i])
        }

        self.ctx.addEventListener("DOMNodeInserted", function(event) {
            if (event.srcElement.attributes) {
                if (typeof event.srcElement.attributes[Vox.attrBind] !== 'undefined') {
                    self.bindElement(event.srcElement);
                }
            }
        });
    };

    self.bindGetterSetter = function(obj, prop, path, element, valueDOM) {
        if (typeof obj === 'undefined') {
            return false;
        }
        var _index = prop.indexOf('.')
        if (_index > -1) {
            return self.bindGetterSetter(obj[prop.substring(0, _index)], prop.substr(_index + 1), path, element, valueDOM);
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

    self.bindElement = function(element) {
        var _path = element.getAttribute(Vox.attrBind);
        var path = _path.split(/[\.\[\]\"\']{1,2}/);
        var objectName = path.shift();
        var object = self.ctx[objectName];
        var tagName = element.tagName.toLowerCase();
        var typeName = element.type.toLowerCase();

        var elementDef = null;
        if (self.elementDef[tagName] !== 'undefined') {
            elementDef = (tagName == 'input') ? self.elementDef.input[typeName] : self.elementDef[tagName];
        }

        var value = Vox.elementValue(object, path.join('.'));
        self.mapping[_path] = value;
        self.bindGetterSetter(object, path.join('.'), _path, element, elementDef.valueDOM)

        // bind event
        if (elementDef != null) {
            element[elementDef.valueDOM] = value;
            element.addEventListener(elementDef.eventType, function() {
                var val = element[elementDef.valueDOM];
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