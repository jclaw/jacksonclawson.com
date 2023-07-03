(function () {
  console.log('hi');
  function draw() {
    const canvas = document.getElementById("tutorial");
    if (canvas.getContext) {
      const ctx = canvas.getContext("2d");
    }
  }
  draw();

})();

