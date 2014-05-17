/* Upcloud interface */

var debug = require('nor-debug');
var HTTPError = require('nor-errors').HTTPError;
var Q = require('q');
var https = require('https');
var UpcloudServer = require('./Server.js');

/** Upcloud API Interface Object */
function Upcloud(opts) {
	opts = opts || {};

	if(typeof opts === 'string') {
		opts = {'auth': opts};
	}

	var self = this;
	self.host = opts.host || 'api.upcloud.com';
	self.auth = opts.auth;

	debug.assert(self.host).typeOf('string');
	debug.assert(self.auth).typeOf('string');
}

Upcloud.prototype.toString = function() {
	return '' + self.host;
};

Upcloud.prototype.toJSON = function() {
	return self.host;
};

/** Generic HTTPS request */
Upcloud.prototype._request = function(path, body, method) {
	debug.assert(path).typeOf('string');

	body = body ? JSON.stringify(body) : undefined;

	var self = this;
	debug.assert(self.host).typeOf('string');
	debug.assert(self.auth).typeOf('string');

	var url_str = "https://"+ self.host + path;
	var url_opts = require('url').parse(url_str);
	url_opts.auth = self.auth;
	var d = Q.defer();
	//debug.log('url_opts = ', url_opts);

	url_opts.method = method || 'GET';
	url_opts.headers = url_opts.headers || {};

	if(process.env.DEBUG_NOR_UPCLOUD !== undefined) {
		debug.log('body = ' , body);
	}

	if(body && (url_opts.method === 'POST')) {
		url_opts.headers['Content-Type'] = 'application/json';
		url_opts.headers['Content-Length'] = body.length;
	}

	var req = https.request(url_opts, function(res) {

		var buf = "";
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			buf += chunk;
		});
		res.on('end', function() {

			var body;
			try {
				body = JSON.parse(buf);
			} catch(e) {
				debug.error('Error parsing body: ', e);
				body = {};
			}

			if(res.statusCode === 429) {
				if(process.env.DEBUG_NOR_UPCLOUD !== undefined) {
					debug.log("res = ", res);
				}
				d.reject(new HTTPError(429, body));
				return;
			}

			if(res.statusCode === 401) {
				if(process.env.DEBUG_NOR_UPCLOUD !== undefined) {
					debug.log("res = ", res);
				}
				d.reject(new HTTPError(401, body));
				return;
			}

			if(res.statusCode !== 200) {
				if(process.env.DEBUG_NOR_UPCLOUD !== undefined) {
					debug.log("res = ", res);
				}
				d.reject(new HTTPError(res.statusCode, body));
				return;
			}
			
			d.resolve( body );
		});

	}).on('error', function(e) {
		d.reject(new TypeError(''+e));
	});

	if(body && (url_opts.method === 'POST')) {
		req.write( body );
	}
	req.end();

	return d.promise;
};

/* Account data */
Upcloud.prototype.account = function() {
	var self = this;
	return self._request('/1.1/account');
};

/* List servers */
Upcloud.prototype.server = function() {
	var self = this;
	return self._request('/1.1/server').then(function(body) {
		//debug.log('body = ', body);
		body.servers.server = body.servers.server.map(function(s) {
			return new UpcloudServer(s, self);
		});
		return body;
	});
};

// Exports
module.exports = Upcloud;

/* EOF */
