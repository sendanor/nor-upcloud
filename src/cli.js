#!/usr/bin/env node
var PATH = require('path');
var Q = require('q');
var util = require('util');
var debug = require('nor-debug');
var is = require('nor-is');
var VIEWS = {};
var COMMANDS = {};

Q.fcall(function() {

	var config_file = PATH.resolve(process.env.HOME, '.nor-upcloud-cli.json');
	var config = require(config_file);

	var Upcloud = require('./index.js');

	var argv = require('minimist')(process.argv.slice(2));
	argv.view = argv.view || 'table';

	debug.assert(argv.view).is('string');

	// Init
	var UP = new Upcloud.API( config.upcloud );

	// Execute COMMANDS
	return argv._.map(function(cmd) {
		return function do_command() {
			if(is.func(COMMANDS[cmd])) {
				return COMMANDS[cmd].call(UP, argv).then(function(data) {
					return VIEWS[argv.view](data);
				}).then(function(data) {
					console.log(data);
				});
			} else {
				throw new TypeError("No command: " + cmd);
			}
		};
	}).reduce(Q.when, Q());

}).fail(function(err) {
	console.log('ERROR: ' + err);
	if(err.stack) {
		if(process.env.DEBUG_NOR_UPCLOUD_CLI !== undefined) {
			debug.log(err.stack);
		}
	}
}).done();

/** Server list command */
COMMANDS['server-list'] = function up_server_list() {
	var UP = this;
	return UP.server();
};

/** Server start command */
COMMANDS['server-start'] = function up_server_start(opts) {
	opts = opts || {};
	var which = opts.uuid || opts.hostname || opts.title;
	debug.assert(which).is('string');

	var UP = this;
	return UP.server().then(function(data) {
		debug.assert(data).is('object');
		debug.assert(data.servers).is('object');
		debug.assert(data.servers.server).is('object');
		var servers = data.servers.server;
		debug.assert(servers).is('array');

		var servers_map = {};

		servers.forEach(function(server) {
			servers_map[ server.uuid ] = server;
			servers_map[ server.hostname ] = server;
			servers_map[ server.title ] = server;
		});

		var server = servers_map[which];

		if(server.state === 'started') {
			throw new TypeError('server already started: ' + server.hostname);
		}

		return server.start().then(function() {
			server.state = 'started';
			return server;
		});
	});
};

/** Server stop command */
COMMANDS['server-stop'] = function up_server_stop(opts) {
	opts = opts || {};
	var which = opts.uuid || opts.hostname || opts.title;
	debug.assert(which).is('string');

	var UP = this;
	return UP.server().then(function(data) {
		debug.assert(data).is('object');
		debug.assert(data.servers).is('object');
		debug.assert(data.servers.server).is('object');
		var servers = data.servers.server;
		debug.assert(servers).is('array');

		var servers_map = {};

		servers.forEach(function(server) {
			servers_map[ server.uuid ] = server;
			servers_map[ server.hostname ] = server;
			servers_map[ server.title ] = server;
		});

		var server = servers_map[which];

		if(server.state === 'stopped') {
			throw new TypeError('server already stopped: ' + server.hostname);
		}

		return server.stop().then(function() {
			server.state = 'stopped';
			return server;
		});
	});
};

/** Get server defails */
COMMANDS['server-info'] = function up_server_info(opts) {
	opts = opts || {};
	var which = opts.uuid || opts.hostname || opts.title;
	debug.assert(which).is('string');

	var UP = this;
	return UP.server().then(function(data) {
		debug.assert(data).is('object');
		debug.assert(data.servers).is('object');
		debug.assert(data.servers.server).is('object');
		var servers = data.servers.server;
		debug.assert(servers).is('array');

		var servers_map = {};

		servers.forEach(function(server) {
			servers_map[ server.uuid ] = server;
			servers_map[ server.hostname ] = server;
			servers_map[ server.title ] = server;
		});

		var server = servers_map[which];
		return server.getInfo();
	});
};

/** JSON data view */
VIEWS.json = function view_json(data) {
	return Q.fcall(function stringify_json() {
		return JSON.stringify(data, null, 2) + '\n';
	});
};

/** Table data view */
VIEWS.table = function view_table(data) {

	/* Print array as table */
	function do_table(arr, title) {
		var map_of_keys = {};
		arr.forEach(function(obj) {
			Object.keys(obj).filter(function(key) {
				return key[0] !== '_';
			}).forEach(function(key) {
				map_of_keys[key] = true;
			});
		});
	
		var keys = Object.keys(map_of_keys);
		keys.sort();

		return ['=== ' + title + ' ==='].concat(
			[keys.join(' | ')]
		).concat( 
			[keys.map(function(k) {
				return '----';
			}).join(' | ')]
		).concat(
			arr.map(function(obj) {
				return keys.map(function(key) {
					return util.inspect( obj[key] ).replace(/\n/g, " ");
				}).join(' | ');
			})
		).join('\n');
	}

	if(is.array(data)) {
		return do_table(data, 'root');
	}

	if(!is.obj(data)) {
		return 'root = ' + util.inspect(data);
	}

	return Object.keys(data).map(function(key) {
		var value = data[key];

		if(is.array(value)) {
			return do_table(value, [key].join('.'));
		}

		if(!is.obj(value)) {
			return [key].join('.') + ' = ' + util.inspect(value);
		}

		return Object.keys(value).map(function(key2) {
			var value2 = value[key2];

			if(is.array(value2)) {
				return do_table(value2, [key, key2].join('.'));
			}

			if(!is.obj(value2)) {
				return [key, key2].join('.') + ' = ' + util.inspect(value2);
			}

			return Object.keys(value2).map(function(key3) {
				var value3 = value2[key3];

				if(is.array(value3)) {
					return do_table(value3, [key, key2, key3].join('.'));
				}

				return [key, key2, key3].join('.') + ' = ' + util.inspect(value3);
			}).join('\n');
		}).join('\n');

	}).join('\n');
};

/* EOF */
