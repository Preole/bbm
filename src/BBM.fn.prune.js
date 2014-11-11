
"use strict";

var BBM = module.exports = require("./BBM.js")
&& require("./BBM.fn.pruneList.js")
&& require("./BBM.fn.pruneBlank.js")
&& require("./BBM.fn.pruneURL.js")
&& require("./BBM.fn.pruneID.js")
&& require("./BBM.fn.pruneText.js")
&& require("./BBM.fn.toHTML.js");

/**
 * Eliminate duplicate CSS identifiers, perform hyperlink URL substitution,
 * remove empty subtrees and collapse incomplete tree structures.
 *
 * @method prune
 * @return {BBM} The current node after pruning operation.
 */
BBM.fn.prune = function ()
{
 return this.pruneList().pruneBlank().pruneURL().pruneID();
};

