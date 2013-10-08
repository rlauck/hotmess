/* Hotmess.js template engine (https://github.com/rlauck/hotmess)
 * @author Ryan Lauck
 */
(function(root){
	"use strict";

	var map = {"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':'&quot;', "'":'&#39;', "/":'&#47;'},
	    html = /&(?!#?\w+;)|<|>|"|'|\//g;
	
	function value(code) {
		if(/^\s*(this|\.)\s*$/.test(code)) return "v"; // match current context: this or .
		if(/^\s*(this)?\.key\s*$/.test(code)) return "i"; // match current iteration key: this.key or .key
		var parts = code.replace(/\\('|\\)/g, "$1") // unescape apostrophe and backslash
										.replace(/\s+/g, ' ') // strip whitespace
										.split(/\.\.\//); // split on parent (../) then generate the context chain
		parts[parts.length-1] = "v."+parts[parts.length-1];
		return parts.join("p.");
	}
	  
	root.hotmess = {
		version: '0.0.2',
		enc: function(s) {
			return s === undefined ? '' : String(s).replace(html, function(c){return map[c] || c;});
		},
		compile: function(tmpl) {
			return Function("v", ("var a,p,i,o='" + tmpl // create context [parent, value, list, key] and begin appending
				.replace(/'|\\/g, '\\$&') // escape quotes and backslashes
				.replace(/\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g, function(m, elseif, test) { // conditional tag
					return elseif ?
						(test ? "';}else if("+value(test)+"){o+='" : "';}else{o+='") :
						(test ? "';if("+value(test)+"){o+='"       : "';}o+='");
				})
				.replace(/\{\{~\s*(?:\}\}|([\s\S]+?)\s*\}\})/g, function(m, list) { // list tag
					if(!list) return "';} }i=p.i;v=p.v;a=p.a;p=p.p;o+='"; // end tag: end loop, pop context
					return "';p={v:v,p:p,i:i,a:a};a="+value(list)+";if(a){i=-1;while(++i < a.length){v=a[i];o+='"; // push context, begin loop
				})
				.replace(/\{\{(&)?\s*([\S]+?)\s*\}\}/g, function(m, unesc, v) { // variable tag
					return "';o+=" + (unesc? "(" : "hotmess.enc(") + value(v) + ");o+='";
				})
				+ "';return o;")
				.replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/\r/g, '\\r') // preserve tabs and newlines (ex: <pre> tags)
				.replace(/(\s|;|\}|^|\{)o\+='';/g, '$1')); // clean empty appends
		}
	};
	
	if(typeof define === 'function' && define.amd) define(root.hotmess);
}(this.exports||this));
