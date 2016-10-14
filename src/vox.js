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
            checkbox: { valueDOM: 'checked', eventType: 'change' },
            password: { valueDOM: 'value', eventType: 'keyup' }
        },
        textarea: { valueDOM: 'value', eventType: 'keyup' },
        select: { valueDOM: 'value', eventType: 'change' }
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
