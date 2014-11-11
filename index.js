var Store = require('./lib/marx-store.js');
var Resource = require('./lib/marx-resource.js')


module.exports = function Marx(name, ops) {
	var self = this,
		store;
	self.db = store = new Store(ops.storage);
	self._workers = {};
	self.util = {};
	self.util.view_buffer = require('./util/view-buffer.js');
	self.worker = function add_resource(name, typ) {
		var resource;
		self._workers[name] = resource = new Resource.input(name, typ, store);
		return resource;
	}
	
	return self
}


/*
	Documents are valid strings of html, applications are programs
	that run in a browser and have access (but do not necessarilly involve or modify)
	the 'document' object. 
	Applications must be composed of at least one Document
1. 	All procedures that do not perform CRUD on the DOM should be 
	implemented in CSS (separation of concerns)
2.	All procedures that respond to user actions should be decoupled
	from the underlying application state
3.	All prceedures that do not fall into 1 or 2 should be performed in 
	a separate thread (unless this leads to an overall detriment to ux)
4.	When conflicts arise, all procedures in an application should differ to proceedures in 2
5.  Data should flow uniformly throughout the application and independently of
	proceedures in 1 and 2 (though it may of course trgger those in 1)
	(Application !== document !== main event loop)


6.	Documents should support hierarchical composition (nesting) from sub documents 
	with heretogenous sources (different transports-- ajax, websockets, fallback structures, and 
	different  request instances on each transport)
7. Documents should be composed independently from the application but only view conditionally to it 
	(All documents in an application should evaluate to a string of valid html, and no documents should )




7.	The state of a document at any given time should be a function of the states
	of its component documents (i.e. a document should not require mutation of its component documents)
8.	Data from one document should be accessible to all sibling documents 
	but flow through the containing application without any sideeffects in the state data of 
	anuy other sibling
	(All sub documents must be able affect the state of their containing document, but must never be 
	able to affect that of their sibling documents)
9. 	Only one modification to the state of the application should be performed within 
	an instance of the stack
	(Application state should be shared among component documents as a semaphore with availability of 1)
	*/