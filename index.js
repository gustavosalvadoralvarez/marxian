var Store = require('./lib/marx-db.js'); 
var Resource = require('./lib/marx-resource.js')


module.exports = function Marx(name, ops){ 
	var self = this, store;
	self.db = store = new Store(ops.storage); 
	self._workers = {};
	self.worker = function add_resource(name, typ) { 
		var resource;
		self._workers[name] = resource = new Resource.input(name, typ, store);
		return resource;
	}
	return self
}