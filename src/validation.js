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