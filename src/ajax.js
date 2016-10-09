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