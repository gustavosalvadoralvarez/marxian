module.exports.fifo = function(parent, interval, max_buff) {
	var parent = document.getElementById(parent),
		buffer = [];
	return function buffered(k, v) {
		console.log('view called');
		if (v && typeof v !== 'string'){
			v = v.toString();
		}
		if (v && !buffer.length){ // these conditions handle cases
			buffer = buffer.push(v); // where view was called by 
			return setTimeout(interval, buffered);			
		}
		if (v) {
			buffer = buffer.push(v);
			return
		}
		var nxt = buffer.shift();
		var frst = parent.children[0];
		console.log(buffer);
		console.log(nxt)
		if (frst){
			parent.removeChild(frst);
		}
		parent.innerHTML += nxt;
		if (buffer.length) {
			setTimeout(interval, buffered);
		}
	}
}

module.exports.newest = function(parent, inverval) {
	var parent = document.getElementById(parent),
		buffer;
	return function newest(k, v) {
		console.log('view called');
		if (Array.isArray(v)){
			v = v.join('\n');
		}
		parent.innerHTML = v.toString();
	}
}