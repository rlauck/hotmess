// Hotmess.js template engine (https://github.com/rlauck/hotmess)
// @author Ryan Lauck
/*
 * --------additions?
 * @ or #: context operator: idx/key/index = iterator, sep = separator on all but last, 
 * slash for end tags?
 * separate key or tag to access global helpers? access from root? add a .helper() API registration method? allow passing a helpers object as second param to render?
 * inline partials?
 * allow inline params to be passed to methods and partials?
 * list/if tags require specifying a partial (or key/method) to call for each iteration - spcifying inline is syntactic sugar for an inline partial? see jsRender
 * add context path to start with / for root path
 * passing an array as the template data automatically loops
 */
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
			return ((s === void(0) ? def : s)+'').replace(html, replacement);
		},
		raw: function(s, def){return (s === void(0) ? def : s)+'';},
		compile: function(tmpl) {
			var src = ("var a,p,o='" + (tmpl||'')
				.replace(/'|\\/g, '\\$&') // escape apostrophe and backslash
				.replace(/\{\{\?(\^)?\s*(!)?\s*(.*?)\}\}/g, function(m, elseif, not, test) { // conditional tag
					return elseif ?
						(test ? "';}else if("+(not||'')+value(test)+"){o+='" : "';}else{o+='") :
						(test ? "';if("+(not||'')+value(test)+"){o+='"       : "';}o+='");
				})
				.replace(/\{\{~(?:(\^)?\}\}|(.+?)\}\})/g, function(m, none, list) { // list tag
					return list ? // if the list tag has contents its a start tag otherwise its a closing tag
						"';p={v:v,p:p,i:i,a:a};a="+value(list)+"||[];i=-1;if(a.length)while(++i < a.length){v=a[i];o+='" : // push context, begin loop
						none ? "';}else{o+='" // else block if array is empty
						     : "';}i=p.i;v=p.v;a=p.a;p=p.p;o+='"; // end loop/else, pop context
				})
				.replace(/\{\{>\s*([\.$\w\xA0-\uFFFF]+?)\s*\}\}/g, function(m, partial){ // partial tag
					return "';o+=hotmess.template('"+partial+"')(v,i);o+='";
				})
				.replace(/\{\{(&)?\s*(\S+?)\s*(?:\:\s*(")?(.+?)"?\s*)?\}\}/g, function(m, unesc, v, q, def) { // variable tag
					return "';o+=hotmess." + (unesc ? "raw(" : "enc(") + value(v) + "," + (q || !def ? "'"+def+"'" : value(def)) + ");o+='";
				})
				+ "';return o;")
				.replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/\r/g, '\\r') // preserve whitespace (ex: <pre>)
				.replace(/(\s|;|\}|^|\{)o\+='';/g, '$1'); // clean empty appends
			try{
				return Function("v,i", src);
			}catch(ex){
				console.log(src);
				throw ex;
			}
		},
		template: function(name, tmpl){
			return !tmpl ? this._t[name] : this._t[name] = (typeof tmpl == 'string' ? this.compile(tmpl) : tmpl);
		}
	};
	
	(typeof define == 'function') && define.amd && define(root.hotmess);
}(this.exports||this));