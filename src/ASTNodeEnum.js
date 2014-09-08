
(function (){
 "use strict";

 var nodeEnum =
 {
  ROOT : "ROOT",
  P : "P",
  STOP : "STOP",
  BLOCKQUOTE : "BLOCKQUOTE",
  COMMENT : "COMMENT",
  PRE : "PRE",
  DIV : "DIV",
  ID : "ID",
  CLASS : "CLASS",
  UL_LI : "UL_LI",
  OL_LI : "OL_LI",
  HEADER : "HEADER",
  DT : "DT",
  DD : "DD",
  DL : "DL",
  TH : "TH",
  TD : "TD",
  TR : "TR",
  HR : "HR",
  LINK_INT : "LINK_INT",
  LINK_EXT : "LINK_EXT",
  LINK_IMG : "LINK_IMG",
  LINK_WIKI : "LINK_WIKI",
  DEL : "DEL",
  INS : "INS",
  UNDER : "UNDER",
  SUB : "SUB",
  SUP : "SUP",
  EM : "EM",
  STRONG : "STRONG",
  CODE : "CODE"
 };

 if (typeof module === "object" && module.exports)
 {
  module.exports = ASTNodeEnum;
 }
}());
