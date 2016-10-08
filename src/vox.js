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