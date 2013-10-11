#Hotmess.js

Hotmess is a javascript templating engine focused on minimalism and performance.

##Features

* Stupid fast!
* Tiny! ~60 loc and <1kb minimized.
* Use in the client and server.
* Logic-less! With support for list iteration, "truthy" conditionals and default values.
* Partials! Reuse templates and keep them concise.

##Usage

Include the script in your page:

    <script src="https://rawgithub.com/rlauck/hotmess/master/hotmess.js">

Creating and rendering a template is as simple as:
  
    var tmpl = hotmess.compile("<p>I'm afraid I just {{color}} myself</p>");
    document.body.innerHTML = tmpl( {color:"blue"} );

###Variables

Variable tags render the named key from the current object/context.
All variables are HTML escaped but can be rendered raw by prepending an {{&amp; ampersand }}.

Code:

    var data = {
      name: "Gob Bluth",
      job: "<b>magician</b>"
    };
    var out = hotmess.compile( "A {{&job}} never reveals his secrets! -{{name}}" )(data);

Output:

    A <b>Magician</b> never reveals his secrets! -Gob Bluth
    
If a variable does not exist, nothing will be rendered unless you provide a default value.
Surround default strings with quotes, or leave them off to name a different key as the default.

Code:

    var tmpl = hotmess.compile( '{{yep}}, {{nope : "missing"}}, {{nope:meh}}' );
    var out = tmpl({
      yep: "yep",
      meh: "well... ok"
    });

Output:

    yep, missing, well... ok

###Arrays

Arrays are iterated with the {{~list}} tag. A plain {{~}} tag closes the list and the inner template
is repeated for each array element. The context in the inner template is set to each array element and
is accessible with the {{.}} tag. Properties of the parent tag are accessed with
the ../ prefix such as {{../parent_property}}.

First a simple example.

Code:

    var tmpl = hotmess.compile( "{{~names}}{{.}} {{~}}" );
    document.body.innerHTML = tmpl( { names: ["George", "Buster", "Lucille"] } );
    
Output:

    George Buster Lucille

------

Now something more complex.
    
Template:

    <ul>
    {{~ names}}
      <li style="{{ style() }}">{{name}} {{../surname}}</li>
    {{~}}
    </ul>

Data:

    {
      surname: "Bluth",
      
      names: [
        { name: "George", gender: "m" },
        { name: "Buster", gender: "m" },
        { name: "Lucille", gender: "f" }
      ],
      
      style: function(value, i) {
        // yep, you can call methods too
        
        var style = value.gender == "f" ? "color:pink;" : "color:blue;";
        
        // bold every other row
        if( i % 2 == 0 ){
          style += "font-weight:bold;";
        }
        
        return style;
      }
    }
    
Output:

    <ul>
      <li style="color:blue;font-weight:bold;">George Bluth</li>
      <li style="color:blue;">Buster Bluth</li>
      <li style="color:pink;font-weight:bold;">Lucille Bluth</li>
    </ul>
    
###Conditionals

Syntax: {{? test}} test is truthy {{?? test2}} test2 is truthy {{??}} else case {{?}}

TODO: create examples

###Partials

Any template may be called from within another template. There are some caveats currently:

* The partial template must be compiled and registered before the parent template is rendered.
* No effort is made to prevent circular references, so infinite loops are possible.

Syntax: {{>partial}}

TODO: create examples

##Benchmarks

I hope to create some more rigorous benchmarks but for now I created a variant of the popular
[Javascript template language shootoff jsPerf](http://jsperf.com/dom-vs-innerhtml-based-templating/836).

##About

I began this project to see how small and fast I could make a full featured template function.
Hotmess is MIT Licensed and based on [doT](https://github.com/olado/doT) and [Mustache](https://github.com/janl/mustache.js).

    
    
    


