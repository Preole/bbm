Temporary Notice
================

BakaBakaMark is currently under refactoring for performance. A major change 
in its API, likely not backwards-compatible, is to be expected. The previous 
stable release can be found in the 1.x branch:

<https://github.com/Preole/bbm/tree/1.x>




Confirmed Changes
-----------------

### Javascript Engine Requirement (Runtime) ###

ECMAScript5 compatible web browser or standalone Javascript engine that 
implements `String.prototype.trim()` and most Array comprehension methods 
such as `.forEach()`, `.reduce()`, `.filter()`. 

- Internet Explorer 9+ 
- Opera 12+
- Safari 5+
- Firefox 3.6+
- Google Chrome 13+
- Konquerer 4.9+
- node.js (Google V8 Javascript Engine)
- Rhino
- PhantomJS


### Javascript Engine Requirement (Build) ###

- Node.js
- Browserify


### Reference Link Elements ###

Reference Links `:{ID}: URL` no longer generates a node in the parse tree, 
and thus no longer qualified as an implicit list breaker.

Reference Link scoping has been removed to reduce implementation complexity. 
That is, if a block-level element has a reference link, and the parent has 
another reference link with the same identifier, the link that's defined 
later in the document shall now overwrite the previously stored URL.



### Line Break Requirements ###

Setext Paragraph delimiters, Horizontal Rules, Fenced Code Blocks, Comment 
Blocks, and Div Block delimiters must be immediately followed by a line 
break, in addition to being the only visible element on the line.



### Hyperlink Display Text ###

- Square bracket balancing has been removed. If internal link URL or link 
  display text contains a closing square bracket, that bracket must be 
  escaped with preceding backslash.
  
- <del>Internal, external, and wiki link display text (Link continuation) no 
  longer interprets inline formatting constructs. Namely, formatting elements 
  such as `**` and `''` now are interpreted literally, rather than adding 
  style and semantic values to the text.</del>



### Text Formatting ###

If a hyperlink, image, or formatting construct fails to close properly, 
the recommended recovery behavior is to interpret the rest of the paragraph 
under that context, until the parent context is closed, or the paragraph ends. 
Examples with HTML Escaping and URL encoding considered:

```
**Strong but not closed

**''Badly Nested** Not Italic.

?<Unclosed URL -[Rest of my document]

**?<URL>-[Rest of my document**
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
<strong><a href="URL">Rest of my document **</a></strong>
</p>
```


### Remove the syntax BlockStop ###

The syntax "BlockStop" has been removed, which can be readily substituted 
with a single escaped space, creating an empty paragraph, then removed in 
the semantic analysis stage.

"""
\\
"""


