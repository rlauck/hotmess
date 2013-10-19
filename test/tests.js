function tmplEquals(name, tmpl, data, expected){
	var template = hotmess.compile(tmpl);
	var html = template(data);
	equal(html, expected, name);
}

test("basic", function(){
	tmplEquals("No template", "test template", {}, "test template");
	tmplEquals("Single brackets", "{test}", {}, "{test}");
	tmplEquals("HTML escape", "{{data}}", {data:"this /& that &#38;"}, "this &#47;&amp; that &#38;");
	tmplEquals("HTML raw", "{{&data}}", {data:"& \" < >"}, "& \" < >");
	tmplEquals("Default", '{{test:"default&"}}', {}, "default&amp;");
	tmplEquals("Default value", '{{test:def}}', {def:"yep&"}, "yep&amp;");
	tmplEquals("Default raw", '{{&test:"&"}}', {}, "&");
	tmplEquals("Default number", '{{test:num}}', {num:0}, "0");
	tmplEquals("Empty data", "<p>{{data}}</p>", {}, "<p></p>");
	tmplEquals("Whitespace", "<p>{{ 	data		\r\n\t}}</p>", {data:"test"}, "<p>test</p>");
	tmplEquals("Integer", "int {{data}}", {data:69}, "int 69");
	tmplEquals("Float", "float {{data}}", {data:3.141590}, "float 3.14159");
	tmplEquals("Dots", "my name is {{person.first}} {{person.middle.initial}} {{person.last}}", {person: {first: "H", middle: {initial: "A"}, last: "L"}}, "my name is H A L");
	tmplEquals("Method", "call {{~list}}{{../m()}}+{{m()}},{{~}}", 
		{
			m: function(v){return this.a+v.a;}, 
			a:1, 
			list: [
				{a:2,m:function(){return this.a;}},
				{a:3,m:function(v){return v.a;}}
			]
		}, "call 3+2,4+3,");
	
	tmplEquals("Method iteration index", 
		"<ul>{{~list}}<li style=\"color:{{../color()}}\">{{.}}</li>{{~}}</ul>", 
		{color:function(v,i){return i%2==0?"white":"yellow";}, list:["a","b","c","d"]},
		"<ul><li style=\"color:white\">a</li><li style=\"color:yellow\">b</li><li style=\"color:white\">c</li><li style=\"color:yellow\">d</li></ul>");
	//tmplEquals("Broken Dots", "{{a.b.c}}", {a: {}}, "");
});

test("conditionals", function(){
	tmplEquals("If else if true", "{{? email}}email:{{email}}{{?^ false}}else{{?}}", {email: "test@test.com"}, "email:test@test.com");
	tmplEquals("If else if false", "{{? email}}email:{{email}}{{?^ !email}}no email{{?}}", {email: ""}, "no email");
	tmplEquals("If else", "{{? email}}email:{{email}}{{?^}}else{{?}}", {}, "else");
	
	throws(function(){hotmess.compile("{{? a}}fail");}, SyntaxError, "Bad syntax");
});

test("iterators", function(){
	tmplEquals("Simple", "{{~ loop}}{{.}}{{~}}", {loop: ["a", "b", "c"]}, "abc");
	tmplEquals("Simple dot", "{{~ loop}}{{.}}{{~}}", {loop: ["a", "b", "c"]}, "abc");
	tmplEquals("Invert", "{{~loop}}{{.}}{{~^}}empty{{~}}", {loop: []}, "empty");
	//tmplEquals("Index", "{{~ loop}}{{.key}}{{.}}{{~}}", {loop: ["a", "b", "c"]}, "0a1b2c");
	tmplEquals("Array of objects", "{{~ loop}}{{name}}{{~}}", 
		{loop: [
			{name:"a"},
			{name:"b"},
			{nope:"c"}
		]},
		"ab"
	);
	tmplEquals("Nested", "{{~ loop}}{{~ inner}}{{.}}{{~}}-{{test}},{{~}}", 
		{loop: [
			{inner:["a", "b"], test:1},
			{inner:["c", "d", "e"], test:2},
			{inner:["f"]},
			{inner:[], test:3},
			{nope:["g"]}
		]},
		"ab-1,cde-2,f-,-3,-,"
	);
	tmplEquals("Parent context", "{{~ loop}}{{../name}}-{{.}}.{{~}}", {name: "test", loop: ["a", "b", "c"]}, "test-a.test-b.test-c.");
	tmplEquals("Nested parent", "{{~ l1}}{{~ l2}}{{~ l3}}{{../../../a}}{{../../b}}{{.}} {{~}}{{~}}{{~}}", 
		{a: "a", l1: [
			{b: "b", l2: [ {l3: [1, 2]} ]},
			{b: "bb", l2: [ {l3: [3]}, {l3: [4, 5]} ]}
		]},
		"ab1 ab2 abb3 abb4 abb5 "
	);
});

test("partials", function(){
	var partial = hotmess.template("part", "<b>{{p}}</b>");
	
	equal(hotmess.compile("<em>{{> part}}</em>")({p:"hi"}), "<em><b>hi</b></em>", "Simple partial");
	
	var tmpl = hotmess.compile("<ul>{{~list}}<li>{{> part}}</li>{{~}}</ul>");
	var data = {list:[{p:"a"},{p:"b"}]};
	equal(tmpl(data), "<ul><li><b>a</b></li><li><b>b</b></li></ul>", "List partial");
});
