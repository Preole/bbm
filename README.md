Temporary Notice
================

BakaBakaMark is currently under refactoring for performance and usability. 
Compatibility-breaking changes in its API and the language are to be expected. 
The previous stable release can be found inside the `old/` folder.



Changes: Typing Simplification (November 14th, 2014)
----------------------------------------------------

### Code Blocks & Inline Code Characters ###

The backtick (grave accent) character "\`" shall replace the ASCII 
double-quote in the syntax for Inline Code and Code Block. 



### Inline Code Relaxation ###

In addition to the Inline Code Character Change, The Inline Code syntax 
now starts with one or more backtick characters, down from three or more. 
Specifically:

```
`Code` ``Code `Nested Code` Code``
```







Updated Confirmed Changes (October 10th, 2014)
----------------------------------------------

### Text Formatting: Inserts and Deletes ###

Text insertion markup `{++ Arbitrary Text ++}` shall be removed from the 
grammar.
  
Text deletion markup has been changed from `{-- Deleted Text --}` into 
just two consecutive dashes: `-- Deleted Text --`.



### Pre-formatted Text Output (October 24th, 2014) ###

Pre-formatted Text Output no longer generates a `<code>` wrapper inside 
the `<pre>` tag.



### ATX-Header Inline Formatting ###

Texts in ATX header can now be formatted with inline elements. That is, 
it's now possible to include hyperlinks, images and bold text in ATX headers, 
so long as they do not contain line breaks or closing ATX tokens.



### Default Alt Text in Images ###

Alt text in image elements shall be left blank, but not undefined by default, 
unless an alt text is explicitly provided using the link continuation syntax.

```
!<http://www.imageHoster.com/something.jpg>

<img src="http://www.imageHoster.com/something.jpg" alt="">
```

```
!<Image.jpg>-[Alt text]

<img src="Image.jpg" alt="Alt text">
```




Confirmed Changes
-----------------

### Javascript Engine Requirement (Runtime) ###

ECMAScript5 compatible web browser or standalone Javascript engine that 
implements `String.prototype.trim()`, Higher-order array iteration methods 
`.forEach() .every() .some() .reduce() .map() .filter()`, and 
`Object.create()`. That is, one of the following Javascript engines:

- Internet Explorer 9+ 
- Opera 12+
- Safari 5+
- Firefox 3.6+
- Google Chrome 13+
- Konquerer 4.9+
- node.js (Google V8 Javascript Engine)
- Rhino
- PhantomJS




### Javascript Development Environment ###

- Node.js with npm (Optional)
- Webpack (Building)
- diff (Testing)
- jshint (Linting; Optional)
- TODO (API Documentation Tool)



### Reference Link Elements ###

Reference Links `:{ID}: URL` no longer generates a node in the parse tree, 
and thus no longer qualified as an implicit list breaker.

Reference Links scoping have been removed to reduce implementation complexity. 
That is, block-level elements no longer has scopes with link identifiers. 
Last-defined valid link identifier wins. 

```
> :{ID}: URL-One

  I'm a paragraph using ?<ID>-[URL-Zero].

:{ID}: URL-Zero
```

In this particular example, the second definition of `ID` shall be used to 
create `<a href="URL-Zero">URL-Zero</a>.




### Line Break Requirements ###

Setext Paragraph delimiters, Horizontal Rules, Fenced Code Blocks, Comment 
Blocks, and Div Block delimiters must be immediately followed by a line 
break.

They will not count as valid delimiting token otherwise. Specifically:

```
- """    
  This is not a pre-formatted code block, but rather an inline code snippet, 
  because there are invisible white space after the starting fence.
  """
```



### Hyperlink Display Text ###

- Square bracket balancing has been removed. If internal link URL or link 
  display text contains a closing square bracket, that bracket must be 
  escaped with a backslash.
  
- <del>Internal, external, and wiki link display text (Link continuation) no 
  longer interprets inline formatting constructs. Namely, formatting elements 
  such as `**` and `''` now are interpreted literally, rather than adding 
  style and semantic values to the text.</del>



### Text Formatting: Error Recovery ###

If a hyperlink, image, or formatting construct fails to close properly, 
the recommended recovery behavior is to interpret the rest of the paragraph 
under that context, until the parent context is closed, or the paragraph ends. 
Examples with HTML Escaping and URL encoding considered:

```
**Strong but not closed

**''Badly Nested** Not Italic.

?<Unclosed URL -[Rest of my document]

**?<URL>-[Rest of my document** Not included
```

```
<p>
<strong>Strong but not closed</strong>
</p>

<p>
<strong><em>Badly Nested</em> Not Italic</strong>
</p>

<p>
<a href="%3F%3CUnclosed%20URL%20-%5BRest%20of%20my%20document%5D">?&lt;Unclosed URL -[Rest of my document]</a>
</p>

<p>
<strong><a href="URL">Rest of my document</a></strong> Not included
</p>
```


### Remove the syntax BlockStop ###

The syntax "BlockStop" has been removed. This functionality can be replaced 
by the Comment syntax, which now occupy a spot in the abstract syntax tree.

```
1. One
2. Two
3. Three

////
////

1. One
2. Two
3. Three
```


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
  
- **Property** _Object_ `_attr`

  Attribute key-value (String-String) pairs for the specific node.

- **Property** _BBM[]_ `_nodes`

  An array of child nodes contained by this instance.
  
- **Property** _BBM_ `_parent`

  The node's parent node.



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

  The current node after its subtree have been validated.



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

