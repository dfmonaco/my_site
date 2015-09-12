(function(window, document, undefined) {
  if(document.querySelector) {
    var codeBlocks = document.querySelectorAll('.content > pre');

    for (var i = 0, len = codeBlocks.length; i < len; i++) {
      codeBlocks[i].classList.add('stretch');
    }
  }
})(window, document);