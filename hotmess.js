/* 
 * Hotmess.js micro-templating kludgework (https://github.com/rlauck/hotmess)
 * @author Ryan Lauck
 */
(function(root){
	"use strict";

	var hotmess = root.hotmess = {
		version: '0.0.1',
		options: {
			encode:      /\{\{(&)?\s*([\S]+?)\s*\}\}/g,
			conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,
			iterate:     /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\}\})/g,
			html:        /&(?!#?\w+;)|<|>|"|'|\//g,
			htmlMap:     {"&":"&#38;", "<":"&#60;", ">":"&#62;", '"':'&#34;', "'":'&#39;', "/":'&#47;'}
		},
		enc: function(s) {
			var map = this.options.htmlMap;
			return s === undefined ? '' : String(s).replace(this.options.html, function(m) {return map[m] || m;});
		},
		compile: function(tmpl, def) {
			var c = this.options,
				sid = 0,
				str = ("var o='" + tmpl
					.replace(/'|\\/g, '\\$&') // escape quotes and backslashes
					.replace(c.conditional, function(m, elsecase, code) {
						return elsecase ?
							(code ? "';}else if(" + value(code) + "){o+='" : "';}else{o+='") :
							(code ? "';if(" + value(code) + "){o+='" : "';}o+='");
					})
					.replace(c.iterate, function(m, iterate) {
						if(!iterate) return "';};i=p.i;p=p.p;} o+='";
						var arr="a"+(++sid);
						return "';var "+arr+"="+value(iterate)+";if("+arr+"){var p={v:v,p:p,i:i},v,i=-1;while(++i < "+arr+".length){v="+arr+"[i];o+='";
					})
					.replace(c.encode, function(m, unesc, code) {
						return "';o+="+(unesc?"(":"hotmess.enc(") + value(code) + ");o+='";
					})
					+ "';return o;")
					.replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/\r/g, '\\r') // preserve whitespace (ex: <pre> tags)
					.replace(/(\s|;|\}|^|\{)o\+='';/g, '$1'); // toss empty appends

			console.log(str);
			try {
				return new Function("v", str);
			} catch (e) {
				if (typeof console !== 'undefined') console.log("Could not create a template function: " + str);
				throw e;
			}
		}
	};
	
	function value(code) {
		if(/^\s*(this|\.)\s*$/.test(code)) return "v";
		if(/^\s*(this)?\.key\s*$/.test(code)) return "i";
		var parts = code.replace(/\\('|\\)/g, "$1")
										.replace(/[\r\t\n]+/g, ' ')
										.split(/\.\.\//);
		parts[parts.length-1] = "v."+parts[parts.length-1];
		return parts.join("p.");
	}
	
	if (typeof exports === 'object') {
		module.exports = hotmess;
	} else if (typeof define === 'function' && define.amd) {
		define(function(){return hotmess;});
	}
}(this));
