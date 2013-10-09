#Hotmess.js

Hotmess is a javascript templating engine focused on minimalism and performance.

##Usage

Creating and rendering a template is as simple as:
  
    var tmpl = hotmess.compile("<p>I'm afraid I just {{color}} myself</p>");
    document.body.innerHTML = tmpl( {color:"blue"} );

###Variables

Variable tags render the named key from the current context, or nothing if it does not exist.
All variables are escaped for HTML but can be rendered raw with an {{&amp; ampersand }}.

Template:

    var data = {
      name: "Gob Bluth",
      job: "<b>magician</b>"
    };
    var out = hotmess.compile("A {{&job}} never reveals his secrets! -{{name}}")(data);

Output:

    A <b>Magician</b> never reveals his secrets! -Gob Bluth

###Arrays

Arrays are iterated with the {{~list}} tag. A plain {{~}} tag closes the list and the inner template
is repeated for each array element. The context in the inner template is set to each array element and
is accessible with the equivalent {{this}} or {{.}} tag. Properties of the parent tag are accessed with
the ../ prefix such as {{../parent_property}}.

Template:

    var tmpl = hotmess.compile("<ul>\n\t{{~names}}<li>{{.}} {{../surname}}</li>\n{{~}}</ul>");
    var out = tmpl({
      surname: "Bluth",
      names: ["George", "Buster", "Lucille"]
    });
    
Output:

    <ul>
      <li>George Bluth</li>
      <li>Buster Bluth</li>
      <li>Lucille Bluth</li>
    </ul>
    
###Conditionals

TODO: write me

###Partials

...eventually...

##About

I began this project to see how small and fast I could make a full featured template function.
Hotmess is based on the work of Laura Doktorova https://github.com/olado/doT with a strong influence 
by Mustache and Handlebars.

    
    
    


