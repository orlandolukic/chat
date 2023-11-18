
Array.prototype.hasElem = function(el) {
	for (var i=0; i<this.length; i++)
	{
		if (this[i]==el) return true;
	}
	return false;
};

function addElem(el) {
	if (!this.hasElem(el))
	{
		this[this.length] = el;
		return this;
	};
	return this;
}

function addRecord(n, r) {
	this[n] = r;
	return this;
}

// Array of simple elements
function removeArrElem(el)
{
	var n = new Array();
	for (var i=0, b = 0; i < this.length; i++)
	{
		if (this[i] == el) continue;
		n[b++] = this[i];
	};
	return n;
}

// Arary of objects, as a return value
function removeArrObjectElem(field, key)
{
	var n = new Array();
	for (var i=0, b = 0; i < this.length; i++)
	{
		if (!this[i][field]) return this;
		if (this[i][field] == key) continue;
		n[b++] = this[i];
	};
	return n;
}

function getObjectFromArr(field, key)
{
	for (var i=0, b = 0; i < this.length; i++)
	{
		if (!this[i][field]) return { length: 0 };
		if (this[i][field] == key) return { length: 1, object: this[i] };
	};
	return { length: 0 };
}

// Grap Object From Array Then Replace
function GOFATR(source_arr, source_field, source_key, dest_field, dest_key)
{
	addRecord.call(getObjectFromArr.call(source_arr, source_field, source_key), dest_field, dest_key);
}

Date.prototype.print = function(h = false)
{
	var a,b;
	a = this.getDate() < 10 ? "0"+this.getDate() : this.getDate();
	b = (this.getMonth()+1) < 10 ? "0"+(this.getMonth()+1) : this.getMonth()+1;
	return (!h ? ( (1900+this.getYear())+"-"+b+"-"+a ) : ( a+"."+b ));
}

Date.prototype.printTime = function(sep = ':') {
	var t, g;
	return ((t = this.getHours())<10 ? "0" + t : t)+sep+((g = this.getMinutes())<10 ? "0"+g : g);
}

String.prototype.isUrl = function() {
	var link = document.getElementsByClassName("test-link")[0];
	if (!link)
	{
		link = document.createElement("a");
		link.className = "test-link";
		link.style.display = "none";
	}
	link.href = this;
  	 var ind = link.host && link.host != window.location.host;
  	 link.href = "";
  	 return ind;
 };