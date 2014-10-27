Temporary Notice
================

BakaBakaMark is currently under refactoring for performance and usability. 
Compatibility-breaking changes in its API and the language are to be expected. 
The previous stable release can be found in the 1.x branch:

<https://github.com/Preole/bbm/tree/1.x/lib/bbm.js>



Updated Confirmed Changes (October 10th, 2014)
----------------------------------------------

### Text Formatting: Inserts and Deletes ###

Text insertion markup `{++ Arbitrary Text ++}` shall be removed from the 
grammar.
  
Text deletion markup has been changed from `{-- Deleted Text --}` into 
just two consecutive dashes: `-- Deleted Text --`.



### Pre-formatted Text Output (October 24th, 2014) ###

Pre-formatted Text Output no longer generates a `<code>` wrapper inside 
the `<pre>` tag, for simplicity reason.



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




### Javascript Engine Requirement (Build) ###

- Node.js
- <del>Browserify</del> <ins>Update October 24th, 2014: Reconsidering;</ins>



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
  escaped with preceding backslash.
  
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

The syntax "BlockStop" has been removed. This functionality can either be 
replaced by a comment node or an empty paragraph with just a backslash.

```
\\
```


