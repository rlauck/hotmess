// Hotmess.js template engine (https://github.com/rlauck/hotmess)
// @author Ryan Lauck
(function(root){
	"use strict";

	var map = {"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':'&quot;', "'":'&#39;', "/":'&#47;'},
	    html = /&(?!#?\w+;)|<|>|"|'|\//g;
	
	function value(code, def){
		if(/^\s*(this)?\.key\s*$/.test(code)) return "i"; // match current iteration key: this.key or .key
		var def = def===undefined ? "" 
			: ","+def.replace(/^(")?([\s\S]*?)(")?$/, function(m, q1, v, q2){return (q1 && q2) || v==='' ? "'"+v+"'" : value(v);});
		return code.replace(/[^\.\/\(\)$\w\xA0-\uFFFF]/g, '') // strip chars that dont belong
			.replace(/(\.\.\/)/g, 'p.')
			.replace(/^((?:p\.)+)?(?:this)?\.?((?:\.?[^\.\(]+)*)(\(\))?/, function(m, p, vals, func){
				return (p||'') + (vals ? 'v.'+vals : 'v') + (func ? "(v,i)" : "") + def;
			});
	}
	  
	root.hotmess = {
		version: '0.0.3',
		enc: function(s,def) {
			return String(s===undefined ? def : s).replace(html, function(c){return map[c] || c;});
		},
		raw: function(s,def) {
			return s === undefined ? def : s;
		},
		compile: function(tmpl) {
			return Function("v,i", ("var a,p,o='" + tmpl
				.replace(/'|\\/g, '\\$&') // escape apostrophe and backslash
				.replace(/\{\{\?(\?)?([\s\S]*?)\}\}/g, function(m, elseif, test) { // conditional tag
					return elseif ?
						(test ? "';}else if("+value(test)+"){o+='" : "';}else{o+='") :
						(test ? "';if("+value(test)+"){o+='"       : "';}o+='");
				})
				.replace(/\{\{~(?:\}\}|([\s\S]+?)\}\})/g, function(m, list) { // list tag
					return list ? 
						"';p={v:v,p:p,i:i,a:a};a="+value(list)+";if(a){i=-1;while(++i < a.length){v=a[i];o+='" : // push context, begin loop
						"';} }i=p.i;v=p.v;a=p.a;p=p.p;o+='"; // end tag: end loop, pop context
				})
				.replace(/\{\{>\s*([\.$\w\xA0-\uFFFF]+?)\s*\}\}/g, function(m, partial){ // partial tag
					return "';o+=("+partial+"(v,i));o+='";
				})
				.replace(/\{\{(&)?\s*(\S+?)\s*(?:\:\s*([\s\S]+?)?\s*)?\}\}/g, function(m, unesc, v, def) { // variable tag
					return "';o+=" + (unesc ? "hotmess.raw(" : "hotmess.enc(") + value(v,def) + ");o+='";
				})
				+ "';return o;")
				.replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/\r/g, '\\r') // preserve whitespace (ex: <pre>)
				.replace(/(\s|;|\}|^|\{)o\+='';/g, '$1')); // clean empty appends
		}
	};
	
	if(typeof define === 'function' && define.amd) define(root.hotmess);
}(this.exports||this));
