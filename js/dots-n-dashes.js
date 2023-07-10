(function () {
  addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("tutorial");
    // draw(canvas);
    // eventListeners(canvas);
  });

  const CANVAS_SIZE_PIXELS = 2000
  const MARGIN = 40
  const BOARD_SIZE = 10
  const PIXELS_PER_SQUARE = (CANVAS_SIZE_PIXELS - MARGIN * 2) / BOARD_SIZE
  // const BOARD_SIZE_PIXELS = BOARD_SIZE * PIXELS_PER_SQUARE
  const BOARD_START_X = MARGIN
  const BOARD_START_Y = MARGIN
  const CIRCLE_RADIUS = 15

  class Dot {
    constructor(xNum, yNum) {
      this.xNum = xNum;
      this.yNum = yNum;
      this.x = BOARD_START_X + xNum * PIXELS_PER_SQUARE;
      this.y = BOARD_START_Y + yNum * PIXELS_PER_SQUARE;
    }
    distanceFrom(dot) {
      return [Math.abs(dot.xNum - this.xNum), Math.abs(dot.yNum - this.yNum)]
    }
    maxDistanceFrom(dot) {
      return Math.max(...this.distanceFrom(dot));
    }
    print() {
      return DotCache.key(this.xNum, this.yNum)
    }
  }

  class DotCache {
    static cache = {}

    static key(xNum, yNum) {
      return `[${xNum},${yNum}]`
    }
    static getDot(xNum, yNum) {
      let key = DotCache.key(xNum, yNum)

      if (key in DotCache.cache) {
        return DotCache.cache[key]
      } else {
        let dot = new Dot(xNum, yNum)
        DotCache.cache[key] = dot
        return dot
      }
    }
  }

  const LINE_STATES = ['hidden', 'hovered', 'filled']
  class Line {
    constructor(start, end) {
      if (!(start instanceof Dot && end instanceof Dot)) {
        throw new Error("Variable is not an instance of Dot class");
      }

      if (start.maxDistanceFrom(end) > 1) {
        throw new Error("Dots are too far apart"); 
      }

      this.start = start;
      this.end = end;
      this.state = 'hidden';
    }

    setState(newState) {
      if (LINE_STATES.includes(newState)) {
        this.state = newState
      }
    }
  }

  class LineCache {
    static cache = {}

    static key(start, end) {
      return `${start.print()},${end.print()}`
    }
    static getLine(start, end) {
      let key = LineCache.key(start, end)

      if (key in LineCache.cache) {
        return LineCache.cache[key]
      } else {
        let line = new Line(start, end)
        LineCache.cache[key] = line
        return line
      }
    }
  }

  class Quadrant {
    constructor(xNum, yNum) {
      this.xNum = xNum;
      this.yNum = yNum;
      this.NW = DotCache.getDot(xNum, yNum)
      this.NE = DotCache.getDot(xNum + 1, yNum)
      this.SW = DotCache.getDot(xNum, yNum + 1)
      this.SE = DotCache.getDot(xNum + 1, yNum + 1)
      this.top = LineCache.getLine(this.NW, this.NE)
      this.right = LineCache.getLine(this.NE, this.SE)
      this.bottom = LineCache.getLine(this.SE, this.SW)
      this.left = LineCache.getLine(this.SW, this.NW)
    }
  }


  function draw(canvas) {
    if (canvas.getContext) {
      const ctx = canvas.getContext("2d");

      for (let i = 0; i < BOARD_SIZE + 1; i++) {
        for (let j = 0; j < BOARD_SIZE + 1; j++) {
          ctx.beginPath();
          let x = BOARD_START_X + i * PIXELS_PER_SQUARE
          let y = BOARD_START_Y + j * PIXELS_PER_SQUARE

          ctx.arc(x, y, CIRCLE_RADIUS, 0, Math.PI * 2, true);
          ctx.fill();
        }
      }
    }
  }

  function eventListeners(canvas) {
    canvas.addEventListener('click', (e) => {
      let [start, end] = detectLine(e.offsetX, e.offsetY)
      drawLine('click', start, end);
    })
  }

  function detectLine(x, y) {
    console.log(x, y);
    return [Point.new(1, 1), Point.new(1, 2)]
  }

  function drawLine(type, startPoint, endPoint) {
    // console.log(start, end);

    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(endPoint.x, endPoint.y);
    ctx.closePath();
  }

})();

