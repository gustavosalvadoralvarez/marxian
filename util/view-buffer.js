module.exports.lifo = function(parent, interval) {
	var parent = document.getElementById('parent'),
		buffer = [];
	return function buffered(k, v) {
		if (v && !buffered.length) {
			buffer.concat(v)
			setTimeout(interval, buffered);
		} else if (v) {
			return buffer.concat(v);
		}
		var nxt = buffer.unshift();
		parent.removeChild(parent.childNodes[0])
		parent.appendChild(nxt);
		if (buffer.length) {
			setTimeout(interval, buffered);
		}
	}
}