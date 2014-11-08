module.exports.lifo = function(parent, interval) {
	var parent = document.getElementById(parent),
		buffer = [];
	return function buffered(k, v) {
		console.log('view called')
		if (v) {
			buffer = buffer.concat(v);
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