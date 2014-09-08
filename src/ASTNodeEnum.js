
(function (global){
 "use strict";

 var nodeEnum =
 {
  ROOT : "ROOT",
  P : "P",
  STOP : "STOP",
  BLOCKQUOTE : "BLOCKQUOTE",
  PRE : "PRE",
  DIV : "DIV",
  ID : "ID",
  CLASS : "CLASS",
  UL_LI : "UL_LI",
  OL_LI : "OL_LI",
  H1 : "H1",
  H2 : "H2",
  H3 : "H3",
  H4 : "H4",
  H5 : "H5",
  H6 : "H6",
  HR : "HR",
  DT : "DT",
  DD : "DD",
  DL : "DL",
  TH : "TH",
  TD : "TD",
  TR : "TR",
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
}(this));
