/* UpcloudServer interface */

var debug = require('nor-debug');

/** Upcloud Server Object */
function UpcloudServer(opts, up) {
	opts = opts || {};

	debug.assert(opts).typeOf('object');
	debug.assert(opts.uuid).typeOf('string');
	debug.assert(up).typeOf('object');

	var self = this;

	self._up = up;

	Object.keys(opts).forEach(function(key) {
		self[key] = ''+opts[key];
	});

	debug.assert(self.uuid).typeOf('string');
}

/* Start server */
UpcloudServer.prototype.start = function(opts) {
	var self = this;
	opts = opts || {};
	debug.assert(opts).typeOf('object');
	debug.assert(self.uuid).typeOf('string');
	return self._up._request('/1.1/server/'+self.uuid+'/start', {}, 'POST');
};

/* Stop servers */
UpcloudServer.prototype.stop = function(opts) {
	var self = this;
	opts = opts || {};
	debug.assert(self.uuid).typeOf('string');
	var body = {
		'stop_server': {
			'stop_type': 'soft'
		}
	};
	return self._up._request('/1.1/server/'+self.uuid+'/stop', body, 'POST');
};

// Exports
module.exports = UpcloudServer;

/* EOF */
