#Hotmess.js

Hotmess is a javascript templating engine with a focus on minimalism and performance during the compilation and rendering stages.

This project is based on the work of Laura Doktorova https://github.com/olado/doT with a nod toward Mustache/Handlebars template syntax.

##Usage

Creating and rendering a template is as simple as:
  
    var tmpl = hotmess.compile("<p>I'm afraid I just {{color}} myself</p>");
    document.body.innerHTML = tmpl( {color:"blue"} );

###Variables

Variable tags render the named key from the current context, or nothing if it does not exist.
All variables are escaped for HTML but can be rendered raw with an {{&amp; ampersand }}.

Example data:

    {
      name: "Gob Bluth",
      job: "<b>magician</b>"
    }
    
Template:

    	A {{&job}} never reveals his secrets! -{{name}}

Output:

    	A <b>Magician</b> never reveals his secrets! -Gob Bluth
    	
    	
###Conditionals


###Loops


