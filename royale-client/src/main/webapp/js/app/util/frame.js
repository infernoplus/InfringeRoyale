  var requestAnimFrameFunc = (function() {
    return window.requestAnimationFrame         || 
           window.webkitRequestAnimationFrame   ||
           window.mozRequestAnimationFrame      ||
           window.oRequestAnimationFrame        ||
           window.msRequestAnimationFrame       ||
           function(callback) { window.setTimeout(callback, 16); };
  })();
  
  var cancelAnimFrameFunc = (function() {
    return window.cancelAnimationFrame                 ||
           window.webkitCancelRequestAnimationFrame    ||
           window.mozCancelRequestAnimationFrame       ||
           window.oCancelRequestAnimationFrame         ||
           window.msCancelRequestAnimationFrame        ||
           clearTimeout;
  })();