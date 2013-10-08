test("basic", function(){
	tmplEquals("No template", "test template", {}, "test template");
	tmplEquals("Single brackets", "{test}", {}, "{test}");
	tmplEquals("HTML escape", "{{data}}", {data:"this /& that &#38;"}, "this &#47;&amp; that &#38;");
	tmplEquals("HTML unescape", "{{&data}}", {data:"& \" < >"}, "& \" < >");
	tmplEquals("Empty data", "<p>{{data}}</p>", {}, "<p></p>");
	tmplEquals("Whitespace", "<p>{{ 	data		\r\n\t}}</p>", {data:"test"}, "<p>test</p>");
	tmplEquals("Integer", "int {{data}}", {data:69}, "int 69");
	tmplEquals("Float", "float {{data}}", {data:3.141590}, "float 3.14159");
	tmplEquals("Dots", "my name is {{person.first}} {{person.middle.initial}} {{person.last}}", {person: {first: "H", middle: {initial: "A"}, last: "L"}}, "my name is H A L");
	
	//tmplEquals("Broken Dots", "{{a.b.c}}", {a: {}}, "");
});

test("conditionals", function(){
	tmplEquals("If else", "{{? email}}email:{{email}}{{?? false}}else{{?}}", {email: "test@test.com"}, "email:test@test.com");
	
	throws(function(){hotmess.compile("{{? a}}fail");}, SyntaxError, "Bad syntax");
});

test("iterators", function(){
	tmplEquals("Simple", "{{~ loop}}{{this}}{{~}}", {loop: ["a", "b", "c"]}, "abc");
	tmplEquals("Simple dot", "{{~ loop}}{{.}}{{~}}", {loop: ["a", "b", "c"]}, "abc");
	tmplEquals("Index", "{{~ loop}}{{.key}}{{.}}{{~}}", {loop: ["a", "b", "c"]}, "0a1b2c");
	tmplEquals("Array of objects", "{{~ loop}}{{name}}{{~}}", 
		{loop: [
			{name:"a"},
			{name:"b"},
			{nope:"c"}
		]},
		"ab"
	);
	tmplEquals("Nested", "{{~ loop}}{{~ inner}}{{this}}{{~}}-{{test}},{{~}}", 
		{loop: [
			{inner:["a", "b"], test:1},
			{inner:["c", "d", "e"], test:2},
			{inner:["f"]},
			{inner:[], test:3},
			{nope:["g"]}
		]},
		"ab-1,cde-2,f-,-3,-,"
	);
	tmplEquals("Parent context", "{{~ loop}}{{../name}}-{{this}}.{{~}}", {name: "test", loop: ["a", "b", "c"]}, "test-a.test-b.test-c.");
	tmplEquals("Nested parent", "{{~ l1}}{{~ l2}}{{~ l3}}{{../../../a}}{{../../b}}{{.}} {{~}}{{~}}{{~}}", 
		{a: "a", l1: [
			{b: "b", l2: [ {l3: [1, 2]} ]},
			{b: "bb", l2: [ {l3: [3]}, {l3: [4, 5]} ]}
		]},
		"ab1 ab2 abb3 abb4 abb5 "
	);
});

function tmplEquals(name, tmpl, data, expected){
	var template = hotmess.compile(tmpl);
	var html = template(data);
	equal(html, expected, name);
}
