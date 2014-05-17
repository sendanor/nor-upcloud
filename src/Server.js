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

UpcloudServer.prototype.valueOf = function() {
	var self = this;
	var tmp = {};
	Object.keys(self).filter(function(key) {
		return key[0] !== '_';
	}).forEach(function(key) {
		tmp[key] = self[key];
	});
	return tmp;
};

/** Get server details */
UpcloudServer.prototype.getInfo = function(opts) {
	var self = this;
	opts = opts || {};
	debug.assert(opts).typeOf('object');
	debug.assert(self.uuid).typeOf('string');
	return self._up._request('/1.1/server/'+self.uuid, {}, 'GET');
};

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

/* Modify server */
UpcloudServer.prototype.modify = function(opts) {
	var self = this;
	opts = opts || {};
	debug.assert(opts).typeOf('object');
	debug.assert(self.uuid).typeOf('string');
	var data = {};

	function parse_bool(x) {
		if( (x === 'on') || (x === 'off') ) { return x; }
		if(x === 'true') { return 'on'; }
		if(x === 'false') { return 'off'; }
		return (x === true) ? 'on' : 'off';
	}

	function parse_array(x) { 
		if(is.array(x)) { return x.join(','); }
		return ''+x;
	}

	var keys = {
		'boot_order'    : parse_array,
		'core_number'   : function(x) { return x; },
		'firewall'      : parse_bool,
		'hostname'      : function(x) { return ''+x; },
		'memory_amount' : function(x) { return x; },
		'nic_model'     : parse_array,
		'title'         : function(x) { return ''+x; },
		'timezone'      : function(x) { return ''+x; },
		'video_model'   : function(x) { return ''+x; },
		'vnc'           : parse_bool,
		'vnc_password'  : function(x) { return ''+x; }
	};

	Object.keys(keys).forEach(function(key) {
		if(opts[key] !== undefined) {
			data[key] = keys[key](opts[key]);
		}
	});

	debug.log("data = ", data);

	return self._up._request('/1.0/server/'+self.uuid, {'server': data}, 'PUT');
};

// Exports
module.exports = UpcloudServer;

/* EOF */
