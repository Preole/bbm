BareBonesMarkup (BBM) v2.0.0
============================

BareBonesMarkup is the renamed second iteration of the lightweight markup 
language markup language BakaBakaMark.

BareBonesMarkup a plain text markup language. It's designed to be 
easily read and written with just a plain text editor independent of 
proprietary rendering software. Moreover, it's also meant to be easily 
interpreted without ambiguity, while leaving plenty of room for further 
customization.

BareBonesMarkup is a also tool, a compiler to transform plain text written 
in this language into a syntax tree, customize it, before finally outputting 
strictly valid (X)HTML, which can be rendered by web browsers for a much 
better viewing experience.

Finally, BareBonesMarkup is an experiment to the following problem:

> Is it possible to have a lightweight markup language that has just enough 
  basic features, can be customized, produce valid output, and is unambiguous 
  for any given texual input?


  



Usage
-----

### Browser ###

Grab a built bundle in the `dist/` folder, then use a `<script>` tag 
to include the library.


```
<!-- Namespace: jQuery, $ -->
<script src="jquery.min.js"></script>

<!-- Namespace: BBM -->
<script src="BBM.min.js"></script> 
<script>



// Install BBM as a static jQuery plugin.
// Install BBM as a jQuery method.

(function ($, BBM){

 var mailtoRegex = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
 var httpsRegex = /^([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

 $.BBM = BBM;
 $.fn.BBM = function (bbmText)
 {
  // 1. Parse plain text (string) into AST (Abstract syntax tree).
  // 2. Add "mailto:" and "https://" prefixes to links in the AST.
  // 3. Convert the AST into HTML string.
  
  return this.html(BBM.parse(bbmText).eachPre(autolink).toHTML());
 };

 function autolink(node)
 {
  var href = node.attr("href") || "";
  if (mailtoRegex.test(href))
  {
   href = "mailto:" + href;
  }
  if (httpsRegex.test(href))
  {
   href = "https://" + href;
  }
  if (href)
  {
   node.attr("href", href);
  }
 }

}(jQuery, BBM));

// textarea value to HTML string, then inserted inside a DOM element.
$("#main").BBM($("#textBox").val());

</script>
```



### node.js ###

```
npm install BBM
```

```
var BBM = require("BBM");
var fs = require("fs");
var text = fs.readFileSync("./article-in-bbm.txt");
var html = BBM.parse(text).eachPre(autolink).toHTML();

function autolink(node)
{
 var href = node.attr("href") || "";
 if (mailtoRegex.test(href))
 {
  href = "mailto:" + href;
 }
 if (httpsRegex.test(href))
 {
  href = "https://" + href;
 }
 if (href)
 {
  node.attr("href", href);
 }
}

//Process the HTML string...
```




Features
--------

### No External Dependency ###

It's just one built bundle; Simple as that.



### Simple Grammar & Semantics ###

The language itself is simple to parse, comprehend, and leaves virtually no 
room for ambiguity.



### Completeness ###

Bullet & Numbered Lists, Tables, Definition Lists, and preformatted blocks,
BareBonesMarkup has the all essentials of a plain text markup language.



### Solid Test Suite ###

A set of carefully designed test cases provide excellent defenses against 
regressions from upgrading & refactoring, and a reference for alternative 
implementations.



### Abstract Syntax Tree API ###

Finally, BareBonesMarkup has its own simple abstract syntax tree API, leaving 
it plenty of room for custom plugins, processing, augmentation, and even 
outputs to different markup languages. 










API Reference Conventions
-------------------------

Given a class name or namespace, The conventions for methods, constants and 
such are as follows, using `Fruit` as an example:

* **Methods**: They'll be attached under the namespace `.fn`, which is the 
  class prototype, followed by a pair of round brackets enclosing the 
  expected parameters.

  `Fruit.fn.ferment(days)`

* **Static Constants**: All upper-case English letters. e.g:

  `Fruit.ENUM`
  
* **Static Methods**: Directly attached to the namespace, 
  followed by a pair of round brackets enclosing the expected parameters.

  `Fruit.sweeten(Food)`

* **Optional Parameters**: Surrounded by a pair of square brackets. May have 
  an equal sign immediately after, which denotes the default parameter value.

  `Fruit.weigh(Scale, [weightUnit=8, [anotherOptional=100]])`
  
* **Private Properties & Variables**: Prefixed with an underscore.

  `Fruit._weight`, `{"_PrivateType" : "_PrivateType"}`.




API Reference
-------------

### Class BBM ###

BBM (BareBonesMarkup) is the class for BareBonesMarkup abstract syntax tree 
node objects, which represent a node within the abstract syntax tree under 
its own grammar ready for transformation. 

The `new` operator is not required. Instance properties prefixed with an 
underscore are meant for private use.

- **Property** _String_ `_type`

  The node's type name, which should be one of the enumerable types from 
  BBM.ENUM.
  
- **Property** _Array.BBM_ `_nodes`

  An array of child nodes contained by this instance.
  
- **Property** _BBM_ `_parent`

  The node's parent node.

- **Property** _Object_ `_attr`

  Attribute key-value (String-String) pairs for this specific node. The 
  following attributes are defined for the following types of nodes for 
  a freshly parsed tree:
  
  - **All (Global attributes; Optional)**
  
      - `id` The CSS Identifier of this node.
      - `class` The CSS Class of this node.
    
  - **LINK\_EXT**, **LINK\_INT**, **LINK\_WIKI**
  
      `href` The link target's URL.
    
  - **LINK\_IMG**
  
      - `src` The image's URL.
      - `alt` The alternative text to display.
    


Coming up next, some types of nodes will contain instance properties in 
addition to ones common in all nodes. A node's type is determined by the 
return value of the method `BBM.fn.type()`.

#### HEADER ####

- **Property** _Number_ `level`

  Denotes the header node's importance level; A level 1 header translates to 
  the most important header, which is `<h1>` in HTML, while higher level 
  headers (N) are less important `<hN>` headers.

#### ROOT ####

- **Property** _Object_ `symTable`

  A symbol table of reference identifiers to URLs. This map is used to 
  substitute identifiers of the `href` and `src` attributes of hyperlink 
  and image elements with the actual URL they're supposed to point to.

  The URL substitution is already completed, if this subtree is generated 
  through either the method `BBM.fn.parse()` or its static counterpart, 
  `BBM.parse()`. No manipulation to this table should be necessary.



### BBM.ENUM ###

Enumerator Object representing a list of node types that are legally allowed 
and reproduceable within the BareBonesMarkup grammar. Node types prefixed 
an underscore are meant for private use.

```
{
 "_DT": "_DT",
 "_DD": "_DD",
 "_TH": "_TH",
 "_TD": "_TD",
 "_TR": "_TR",
 "_LI_UL": "_LI_UL",
 "_LI_OL": "_LI_OL",
 "_ID": "_ID",
 "_CLASS": "_CLASS",
 "_DUMMY": "_DUMMY",
 
 "ROOT": "ROOT",
 "COMMENT": "COMMENT",
 "P": "P",
 "BLOCKQUOTE": "BLOCKQUOTE",
 "PRE": "PRE",
 "DIV": "DIV",
 "LI": "LI",
 "UL": "UL",
 "OL": "OL",
 "HEADER": "HEADER",
 "DT": "DT",
 "DD": "DD",
 "DL": "DL",
 "TH": "TH",
 "TD": "TD",
 "HR": "HR",
 "TR": "TR",
 "TABLE": "TABLE",
 "LINK_INT": "LINK_INT",
 "LINK_EXT": "LINK_EXT",
 "LINK_IMG": "LINK_IMG",
 "LINK_WIKI": "LINK_WIKI",
 "DEL": "DEL",
 "U": "U",
 "SUB": "SUB",
 "SUP": "SUP",
 "EM": "EM",
 "BOLD": "BOLD",
 "CODE": "CODE",
 "TEXT": "TEXT"
}
```

### BBM.isNode(target) ###

Checks whether the given parameter is an instance of BBM Object.

* **Static**
* **Param** _Anything_ `target`

  The object to check its type of.
  
* **Return** _Boolean_

  True if the target is an instance of BBM. False otherwise.



### BBM.parse(bbmStr, [maxDepth=8]) ###

Parses a piece of text into its abstract syntax tree representation for 
further processing, manipulation, and eventual output.

* **Static**
* **Param** _String_ `bbmStr`

  The BareBonesMarkup text to be parsed.

* **Param** _Number_ `[maxDepth=8]`

  The maximum allowed nesting level. Text blocks exceeding this nesting 
  limit shall be interpreted as paragraphs.

* **Return** _BBM_

  The root node of the abstract syntax tree obtained from the parsing run.
  The root node will have the type `"ROOT"`.
  
  The tree nodes, in addition to their the base instance properties, 
  shall have the following properties for specific types of nodes:
 
  * **HEADER**: (Number) _level_; The heading level of the node. "1" 
    denotes the most important heading, while "6" is the least important.
    
  * **ROOT**: (Object) _symTable_; A ID-URL mapping key-value for URL 
    substitution in `LINK_INT`, `LINK_EXT`, `LINK_WIKI` and `LINK_IMG` 
    elements.




### BBM.fn.parse(bbmStr, [maxDepth=8]) ###

Replaces the node's content with the parsed syntax tree obtained from 
`BBM.parse()`. 

* **Param** _String_ `bbmStr`

  The BareBonesMarkup text to be parsed.

* **Param** _Number_ `[maxDepth=8]`

* **Return** _BBM_

  The current node with its child nodes replaced by the children of the 
  newly parsed subtree, without the wrapping `"ROOT"` node.
  
  ```
  var rawText = [
   "Paragraph",
   "Paragraph",
   "Paragraph"
  ].join("\n\n");
  
  var blockquote = BBM(BBM.ENUM.BLOCKQUOTE).parse(rawText);
  
  blockquote.first().type() === BBM.ENUM.P; //true
  blockquote.last().type() === BBM.ENUM.P; //true
  blockquote.last() === blockquote.first(); //false
  ```
  
* **See** BBM.parse()



### BBM.fn.toHTML([options]) ###

Transforms the current subtree into Standards-Compliant (X)HTML text.

* **Param** _Object_ `options`

  Configuration object for code generation. The following options are 
  available:
  
  * **[maxAttrChars=2048]** _Number_
  
    The maximum number of characters allowed in attribute values and keys.
    
  * **[headerOffset=0]** _Number_
  
    Increments header tags' level in the output. E.g: For a headerOffset 
    of 1, `<h1>` will become `<h2>`, and `<h2>` will become `<h3>`, and 
    so on, up to a maximum of `<h6>`.
    
  * **[xhtml=false]** _Boolean_
  
    If true, output XHTML-compliant HTML.
    
  * **[comments=false]** *Boolean*
  
    If true, output HTML comments.
    
* **Return** _String_

  The HTML Output of this subtree.
  
  
  
### BBM.fn.prune() ###

Eliminate duplicate CSS identifiers, perform hyperlink URL substitution,
remove empty subtrees, transform incomplete tree structures and collapse
consecutive text nodes.

* **Private**
* **Return** _BBM_

  The current node after its subtree have been validated & pruned.



### BBM.fn.splice(from, [count, [elems]]) ###

Low level method used to insert and delete child nodes.

* **Param** _Number_ from 

  The index to start manipulating the child node list from.

* **Param** _Number_ [count] 

  The number of child nodes to remove from this index.
  
  **Param** _String | BBM | Array.String | Array.BBM_ [elems]
  
  One or more BBM nodes or text to insert into the starting index.
  Text inserted this way shall be treated as text nodes instead of being 
  parsed by the syntax rules.
  
* **Return** _BBM_

  The current node with new content inserted and child nodes detached.




### BBM.fn.parent() ###

Retrieves the node's parent node.
  
* **Return** _BBM | undefined_

  Retrieves the parent node if it exists; undefined otherwise.

  
  

### BBM.fn.children([shallow]) ###

Retrieves the node's children list.

* **Param** _Boolean_ `shallow`

  If true, retrieves a shallow copy of the children array instead.

* **Return** _Array.BBM_

  The Array used to hold the node's children.




### BBM.fn.size() ###

Retrieves the number of child nodes the current node contains.

* **Return** _Number_

  The number of children the node holds.



### BBM.fn.first() ###

Retrieves the first child node of the current node.

* **Return** _BBM | undefined_

  Retrieves the node if it exists; undefined otherwise.



### BBM.fn.last() ###

Retrieves the last child node of the current node.

* **Return** _BBM | undefined_

  Retrieves the node if it exists; undefined otherwise.




### BBM.fn.isFirstChild() ###

Checks whether the current node is the first child of its parent.

* **Return** _Boolean_

  True if it has a parent and is the first child. False otherwise.




### BBM.fn.isLastChild() ###

Checks whether the current node is the last child of its parent.

* **Return** _Boolean_

  True if it has a parent and is the last child. False otherwise.



### BBM.fn.pop() ###

Removes the last child node of the current node.

* **Return** _BBM | undefined_

  The removed child node, or undefined if there's no such node.



### BBM.fn.shift() ###

Removes the first child node of the current node.

* **Return** _BBM | undefined_

  The removed child node, or undefined if there's no such node.



### BBM.fn.prepend(content) ###

Adds one or more nodes to the end of this node's children list.

* **Param** _BBM | String | Array.BBM | Array.String_ [content] 

  One or more BareBonesMarkup texts or node objects to add to the end 
  of the node's children list. Text inserted this way shall be treated 
  as text nodes instead of being parsed by the syntax rules.
  
* **Return** _BBM_

  The current node with newly appended content.



### BBM.fn.prepend(content) ###

Adds one or more nodes to the beginning of this node's children list.

* **Param** _BBM | String | Array.BBM | Array.String_ [content] 

  One or more BareBonesMarkup texts or node objects to add to the beginning 
  of the node's children list. Text inserted this way shall be treated as 
  text nodes instead of being parsed by the syntax rules.
  
* **Return** _BBM_

  The current node with newly prepended content.



### BBM.fn.replaceWith(content) ###

Replaces the current node with some other content in its belonging subtree. 
If the current node has no parent, this operation does nothing.

* **Param** _BBM | String | Array.BBM | Array.String_ [content] 

  One or more BareBonesMarkup texts or node objects to replace the current 
  node's position. Text inserted this way shall be treated as text nodes 
  instead of being parsed by the syntax rules.
  
* **Return** _BBM_

  The current node removed from its belonging subtree.



### BBM.fn.replace(target) ###

The inverse operation of BBM.fn.replaceWith; The current node will take 
the place of the target node, if the target is a BBM instance and it 
has a parent node. Otherwise, this operation does nothing.

* **Param** _BBM_ [target] 

  The target node to replace using the current node.
  
* **Return** _BBM_

  The currend node attached to the target's subtree.



### BBM.fn.empty() ###

Detaches all child nodes from the current node.

* **Return** _BBM_

  The current node with all child nodes removed.



### BBM.fn.filterChild(callback) ###

Filters the node's children list, keeping ones that passes the callback 
check while discarding those otherwise.

* **Param** _function_ `callback(node, index, sibs)`

  The method to invoke upon visiting a child. Return a truthy value to 
  keep the child; Falsy to discard.
  
  The callback function signature:
  
  * **Context** _BBM_ 
  
    The parent of these child nodes; It is initially empty, and will be 
    appended of nodes that has passed the callback check.
  
  * **Param** _BBM_ `node`
  
    The current node being visited.

  * **Param** _Number_ `index`
  
    The index of the current node before it was removed.
    
  * **Param** __Array.BBM__ `sibs`
  
    The removed children Array that contained the nodes the current node
    used to contain.
  
* **Return** _BBM_

  The current node with child nodes removed for failing the callback check.




### BBM.fn.rebuildChild(callback) ###

Empties the node's children list, then iterates through the former list 
to rebuild the node's children.

* **Param** _function_ `callback(parent, node, index, sibs)`

  The method to invoke upon visiting a child. To add a particular child node 
  back, invoke the parent node's manipulation method explicitly. e.g: 
  
  ```
  var root = BBM.parse(input).rebuildChild(function (parent, node){
   if (node.type() === "P")
   {
    parent.append(node);
   }
  });
  ```
  
  The callback function signature:
  
  * **Param** _BBM_ `parent`
  
    The parent of these child nodes.
  
  * **Param** _BBM_ `node`
  
    The current node being visited.

  * **Param** _Number_ `index`
  
    The index of the current node before it was removed.
    
  * **Param** __Array.BBM__ `sibs`
  
    The removed children Array that contained the nodes the current node
    used to contain.
  
* **Return** _BBM_

  The current node with explicitly re-attached child nodes.




### BBM.fn.eachPre(callback, [params]) ###

Iterates the node's subtree using depth-first, pre-order traversal, 
executing the callback once per node including the current node.

* **Param** _function_ `callback(node, params)`

  The method to invoke upon visiting a node. It'll have the following 
  signature:
  
  * **Context** _BBM_ 
  
    The root of the subtree that started this function call.
  
  * **Param** _BBM_ `node`
  
    The current node being visited.

  * **Param** _Anything_ `params`
  
    A single extra parameter passed along with the callback function.
    
* **Param** _Anything_ `params`

  An extra parameter to pass into the callback function.
  
* **Return** _BBM_

  The node that started the subtree traversal.




### BBM.fn.find(callback, [params]) ###

As `BBM.fn.eachPre(callback. [params])`, but returns a list of nodes the 
callback returns a truthy value for.

* **Param** _function_ `callback(node, params)`

  The method to invoke upon visiting a node. Return a truthy value 
  to add to the result list; Falsy otherwise. It'll have the following 
  signature:
  
  * **Context** _BBM_ 
  
    The root of the subtree that started this function call.
  
  * **Param** _BBM_ `node`
  
    The current node being visited.

  * **Param** _Anything_ `params`
  
    A single extra parameter passed along with the callback function.
    
* **Param** _Anything_ `params`

  An extra parameter to pass into the callback function.
  
* **Return** _Array.BBM_

  An Array of pointers to nodes that passed the callback filtering.
  
  
  



### BBM.fn.eachPost(callback, [params]) ###

Iterates the node's subtree using depth-first, post-order traversal, 
executing the callback once per node including the current node.

* **Param** _function_ `callback(node, params)`

  The method to invoke upon visiting a node. It'll have the following 
  signature:
  
  * **Context** _BBM_ 
  
    The root of the subtree that started this function call.
  
  * **Param** _BBM_ `node`
  
    The current node being visited.

  * **Param** _Anything_ `params`
  
    A single extra parameter passed along with the callback function.
    
* **Param** _Anything_ `params`

  An extra parameter to pass into the callback function.
  
* **Return** _BBM_

  The node that started the subtree traversal.




### BBM.fn.text([val]) ###

Retrieves or sets the text value of this node. If the text value retrieved
is not the empty String `""`, this node is considered a text node.

* **Param** _String | Number_ `[val]`
  
  The text value to set the node's value into. If this value is not omitted 
  and it's not an empty string, it will transform the current node into a 
  text node, effectively discarding its type name.
  
* **Return** _String | BBM_

  - If no parameter, returns the text value of the current node. A non-empty 
    string (That is, not `""`) means the node is a text node.
    
  - Returns the current node with newly set text value otherwise.



### BBM.fn.attr([key, [val]]) ###

Retrieves or sets the attributes of this node.

* **Param** _String | Object_ `[key]`
  
  * If an object, copies the direct properties of that object onto the 
    node's attribute map.
    
  * If a string, sets the attribute key with the second 
    parameter, `val`.
    
  * If omitted, does nothing.

* **Param** _String | Number_ `[val]`

  The attribute value to set under a given key, if the first parameter 
  is a string.

* **Return** _Object | String | BBM_

  * If no parameter is supplied, returns the node's attribute object.
  * If only the key is supplied and it's not an object, returns the 
    corresponding attribute value.
  * Returns the current node (Possibly modified) otherwise.



### BBM.fn.removeAttr([key]) ###

Removes one, or all attribute key value pairs from the current node.

* **Param** _String | Number_ `[key]`

  The attribute key to remove. If omitted, all attributes in this node
  shall be removed.

* **Return** _[BBM]_

  The current node with attributes removed.



### BBM.fn.type([newType]) ###

Retrieves or sets the node's type.

* **Param** _String_ `[newType]`

  The type value to set the node into. If absent, does nothing.

* **Return** _[BBM | String]_

  If a new type parameter is supplied, returns the modified node; Otherwise, 
  returns the node's type name.



### BBM.fn.toJSON() ###

Helper method; Creates a shallow copy of the current node ready for conversion 
into JSON strings using `JSON.stringify()`. Use `JSON.stringify(bbmNode)` to 
obtain a JSON view of the current node and its subtree.

* **return** _Object_

  The current node object without circular pointers.

