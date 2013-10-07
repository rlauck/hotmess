var tests = {
	"basic": {
		"No template": ["test template", {}, "test template"],
		"Single brackets": ["{test}", {}, "{test}"],
		"HTML escape": ["{{data}}", {data:"this /& that &#38;"}, "this &#47;&#38; that &#38;"],
		"HTML unescape": ["{{&data}}", {data:"& \" < >"}, "& \" < >"],
		"Empty data": ["<p>{{data}}</p>", {}, "<p></p>"],
		"Integer": ["int {{data}}", {data:69}, "int 69"],
		"Float": ["float {{data}}", {data:3.141590}, "float 3.14159"],
		"Dots": ["my name is {{person.first}} {{person.middle.initial}} {{person.last}}", {person: {first: "H", middle: {initial: "A"}, last: "L"}}, "my name is H A L"],
		
		"Broken Dots": ["{{a.b.c}}", {a: {}}, "", false]
	},
	"conditionals": {
		"If else": ["{{? email}}email:{{email}}{{?? false}}else{{?}}", {email: "test@test.com"}, "email:test@test.com"]
	},
	"iterators": {
		"Simple": ["{{~ loop}}{{this}}{{~}}", {loop: ["a", "b", "c"]}, "abc"],
		"Simple dot": ["{{~ loop}}{{.}}{{~}}", {loop: ["a", "b", "c"]}, "abc"],
		"Index": ["{{~ loop}}{{.key}}{{~}}", {loop: ["a", "b", "c"]}, "012"],
		"Array of objects": ["{{~ loop}}{{name}}{{~}}", 
			{loop: [
				{name:"a"},
				{name:"b"},
				{nope:"c"}
			]}, "ab"],
		"Object keys": ["{{~ obj}}{{this.key}}:{{this}},{{~}}", {obj: { name:"a", id:"b", yep:"c" }}, "name:a,id:b,yep:c,"],
		"Nested": ["{{~ loop}}{{~ inner}}{{this}}{{~}}{{~}}", 
			{loop: [
				{inner:["a", "b"]},
				{inner:["c", "d", "e"]},
				{inner:["f"]},
				{inner:[]},
				{nope:["g"]}]}, "abcdef"],
		"Parent context": ["{{~ loop}}{{../name}}-{{this}}.{{~}}", {name: "test", loop: ["a", "b", "c"]}, "test-a.test-b.test-c."],
		"Nested parent": ["{{~ l1}}{{~ l2}}{{~ l3}}{{../../../a}}{{../../b}}{{.}} {{~}}{{~}}{{~}}", 
			{a: "a", l1: [
				{b: "b", l2: [ {l3: [1, 2]} ]},
				{b: "bb", l2: [ {l3: [3]}, {l3: [4, 5]} ]}
			]},
			"ab1 ab2 abb3 abb4 abb5 "
		]
	}
};

function testCase(cases){
	return function(){
		for(var cn in cases){
			var c = cases[cn];
			if(c[3] === false) continue;
			var tmpl = hotmess.compile(c[0]);
			equal(tmpl(c[1]), c[2], cn);
		}
	};
}

for(var name in tests){
  var cases = tests[name];
	test(name, testCase(cases));
}
