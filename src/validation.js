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