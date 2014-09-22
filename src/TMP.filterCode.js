/*
TODO: Block-Level Tree Pruning
------------------------------
*/
function createCells(cellCount)
{
 var cells = Array(cellCount);
 cells.forEach(function (val, index, array){
  array[index] = ASTNode.create(enumAST.TD);
 });
 return cells;
}

//Remove empty block elements, post-order traversal.
function reduceBlock(acc, node, index, sibs)
{
 if (!(node instanceof ASTNode)) //Guard case
 {
  return acc;
 }

 var next = sibs[index + 1],
  first = node.nodes[0],
  isPre = node.type === enumAST.PRE;
  
 if (!isPre && first && astListInline.indexOf(first.type) !== -1)
 {
  node.nodes = node.nodes.reduce(reduceInline, []);
 }
 else if (astListBlock.indexOf(node.type) !== -1)
 {
  node.nodes = node.nodes.reduce(reduceBlock, []);
 }

 if (node.type === enumAST.TABLE)
 {
  node.nodes = node.nodes.reduce(reduceTR, []);
 }
 else if (node.type === enumAST.DL)
 {
  pruneDL(node);
 }
 else if ((node.type === enumAST.ID || node.type === enumAST.CLASS) && next)
 {
  pruneIDClass(node, next);
 }
 else if (astListLonePara.indexOf(node.type) !== -1)
 {
  pruneLonePara(node);
 }
 
 if (astListAlone.indexOf(node.type) !== -1 || node.nodes.length > 0)
 {
  acc.push(node);
 }
 return acc;
}

function reduceTR(acc, rowNode)
{
 var gCol = acc[0] ? acc[0].nodes.length : rowNode.nodes.length;
  rCol = rowNode.nodes.length;
  
 if (rCol <= 0)
 {
  return acc;
 }
 else if (rCol > gCol)
 {
  rowNode.nodes = rowNode.nodes.slice(0, gCol);
 }
 else if (rCol < gCol)
 {
  rowNode.nodes = rowNode.nodes.concat(createCells(gCol - rCol));
 }
 acc.push(rowNode);
 return acc;
}

function pruneDL(node)
{
 var first = node.first();
 while (first && first.type === enumAST.DD)
 {
  node.nodes.shift();
 }
 
 var last = node.last();
 while (last && last.type === enumAST.DT)
 {
  node.nodes.pop();
 }
}

function pruneIDClass(node, next)
{
 if (node.attr["class"])
 {
  if (!utils.isString(next.attr["class"]))
  {
   next.attr["class"] = "";
  }
  next.attr["class"] += node.attr["class"] + " ";
 }
 else if (node.attr.id)
 {
  next.attr.id = node.attr.id;
 }
}

function pruneLonePara(node)
{
 var first = node.first(),
  nodeCount = node.nodes.length;

 if (nodeCount === 1 && first && first.type === enumAST.P)
 {
  node.nodes = first.nodes;
 }
}


/*
TODO: Inline-Level Tree Pruning & URL Substitution
---------------------------
*/

/**
 * this = The root AST Node.
 */
function someNotWS(node)
{
 if (node.type === enumAST.TEXT)
 {
  return !utils.isBlankString(node.text());
 }
 if (linksAST.indexOf(node.type) > -1)
 {
  node.attr.href = this.refTable[node.attr.href] ? this.refTable[node.attr.href] : node.attr.href;
  if (!node.some(someNotWS, this))
  {
   node.empty().append(node.attr.href);
  }
  return true;
 }
 return linksImgAST.indexOf(node.type) > -1 || node.some(someNotWS, this);
}

function resolveURL(node)
{
 var href = node.attr.href,
  urlMap = this.refTable;

 node.attr.href = utils.hasOwn(urlMap, href) ? urlMap[href] : href;
 if (!node.some(someNotWS, this))
 {
  node.empty().append(node.attr.href);
 }
}

function resolveSRC(node)
{
 var src = node.attr.src,
  urlMap = this.refTable;

 node.attr.src = utils.hasOwn(urlMap, src) ? urlMap[src] : src;
}


