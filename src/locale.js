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