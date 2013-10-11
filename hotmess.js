// Hotmess.js template engine (https://github.com/rlauck/hotmess)
// @author Ryan Lauck
(function(root){
	"use strict";

	var map = {"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':'&quot;', "'":'&#39;', "/":'&#47;'},
	    html = /&(?!#?\w+;)|<|>|"|'|\//g,
	    replacement = function(c){return map[c];};
	
	function value(code){
		if(/^\s*\.key\b/.test(code)) return "i"; // match current iteration key
		return code.replace(/[^\.\/\(\)$\w\xA0-\uFFFF]/g, '') // strip control chars and whitespace
			.replace(/(\.\.\/)/g, 'p.') // replace the parent context operator
			.replace(/^((?:p\.)+)?\.?((?:\.?[^\.\(]+)*)(\(\))?/, // match on parent/current context and property/method
				function(m, p, vals, func){ return [p] + (vals ? 'v.'+vals : 'v') + (func ? '(v,i)' : ''); });
	}
	  
	root.hotmess = {
		version: '0.0.4',
		_t: {},
		enc: function(s, def) {
			//return ((s === void(0) ? def : s)+'').replace(html, replacement);
			return String.replace(s === void(0) ? def : s, html, replacement);
		},
		raw: function(s, def) {
			return s === void(0) ? def : s;
		},
		compile: function(tmpl) {
			return Function("v,i", ("var a,p,o='" + (tmpl||'')
				.replace(/'|\\/g, '\\$&') // escape apostrophe and backslash
				.replace(/\{\{\?(\?)?(.*?)\}\}/g, function(m, elseif, test) { // conditional tag
					return elseif ?
						(test ? "';}else if("+value(test)+"){o+='" : "';}else{o+='") :
						(test ? "';if("+value(test)+"){o+='"       : "';}o+='");
				})
				.replace(/\{\{~(?:\}\}|(.+?)\}\})/g, function(m, list) { // list tag
					return list ? // if the list tag has contents its a start tag otherwise its a closing tag
						"';p={v:v,p:p,i:i,a:a};a="+value(list)+";if(a){i=-1;while(++i < a.length){v=a[i];o+='" : // push context, begin loop
						"';}}i=p.i;v=p.v;a=p.a;p=p.p;o+='"; // end loop, pop context
				})
				.replace(/\{\{>\s*([\.$\w\xA0-\uFFFF]+?)\s*\}\}/g, function(m, partial){ // partial tag
					return "';o+=hotmess.template('"+partial+"')(v,i);o+='";
				})
				.replace(/\{\{(&)?\s*(\S+?)\s*(?:\:\s*(")?(.+?)"?\s*)?\}\}/g, function(m, unesc, v, q, def) { // variable tag
					return "';o+=" + (unesc ? "hotmess.raw(" : "hotmess.enc(") + value(v) + "," + (q || !def ? "'"+def+"'" : value(def)) + ");o+='";
				})
				+ "';return o;")
				.replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/\r/g, '\\r') // preserve whitespace (ex: <pre>)
				.replace(/(\s|;|\}|^|\{)o\+='';/g, '$1')); // clean empty appends
		},
		template: function(name, tmpl){
			return !tmpl ? this._t[name] : this._t[name] = (typeof tmpl == 'string' ? this.compile(tmpl) : tmpl);
		}
	};
	
	(typeof define == 'function') && define.amd && define(root.hotmess);
}(this.exports||this));