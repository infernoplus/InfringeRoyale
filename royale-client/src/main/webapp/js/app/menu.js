"use strict";
/* global main */

function Menu() {
  
  window.history.pushState({html:"index.html", pageTitle:"Infringe Royale"}, "", "#");
  
  /* Register all menu classes here*/
  var m = [
    {id: "warn", obj: new MenuWarn()}, // Special, displays on top. Non-exclusive.
    {id: "error", obj: new MenuError()},
    {id: "load", obj: new MenuLoad()},
    {id: "main", obj: new MenuMain()},
    {id: "name", obj: new MenuName()},
    {id: "game", obj: new MenuGame()}
  ];
  
  this.menus = [];
  for(var i=0;i<m.length;i++) {
    this.menus[i] = (m[i].obj);
    this[m[i].id] = m[i].obj;
  }
  
  this.lastNav = "";
  var tmp = this;
  window.onpopstate = function(e) {
    if(tmp[tmp.lastNav] && tmp[tmp.lastNav].onBack) { tmp.onBack(); return; }
    if(e.state && e.state.pageTitle !== "Infringe Royale"){
        document.getElementById("content").innerHTML = e.state.html;
        document.title = e.state.pageTitle;
    }
    else if(e.state && e.state.pageTitle === "Infringe Royale"){
      window.history.back();
    }
  };
  
  this.hideAll();
  document.getElementById('body').style.display = "block";
};

Menu.prototype.hideAll = function() {
  for(var i=1;i<this.menus.length;i++) { /* Skip first element because it's non-exclusive */
    this.menus[i].hide();
  }
};

/* Pushes menu changes into history state. */
Menu.prototype.navigation = function(id, nam) {
  this.lastNav = id;
  window.history.replaceState({html:"index.html", pageTitle:"Infringe Royale"}, nam, "#"+nam);
};

Menu.prototype.onBack = function() {
  window.history.pushState({html:"index.html", pageTitle:"Infringe Royale"}, "", "#");
  this[this.lastNav].onBack();
};