var Store = require('./lib/marx-store.js'); 
var Resource = require('./lib/marx-resource.js')
var Render = require('./util/hgrender2.js')

module.exports = function Marx(name, ops){ 
	var self = this, store;
	self.db = store = new Store(ops.storage); 
	self._workers = {};
	self.worker = function add_resource(name, typ) { 
		var resource;
		self._workers[name] = resource = new Resource.input(name, typ, store);
		return resource;
	}
	self.view = Render;
	return self
}