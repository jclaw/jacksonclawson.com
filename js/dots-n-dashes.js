(function () {
  window.addEventListener('DOMContentLoaded', () => {
    // const canvas = document.getElementById("tutorial");
    // draw(canvas);
    // eventListeners(canvas);

    const gameBoard = document.getElementById('game-board')
    init(gameBoard)
    eventListeners(gameBoard)
  })

  const CANVAS_SIZE_PIXELS = 2000
  const MARGIN = 40
  const BOARD_SIZE = 10
  const PIXELS_PER_SQUARE = (CANVAS_SIZE_PIXELS - MARGIN * 2) / BOARD_SIZE
  // const BOARD_SIZE_PIXELS = BOARD_SIZE * PIXELS_PER_SQUARE
  const BOARD_START_X = MARGIN
  const BOARD_START_Y = MARGIN
  let TURN_TICKER = 0
  const PLAYER_CLASSES = ['player0', 'player1']
  let POINTS

  class Dot {
    constructor (xNum, yNum) {
      this.xNum = xNum
      this.yNum = yNum
      this.x = BOARD_START_X + xNum * PIXELS_PER_SQUARE
      this.y = BOARD_START_Y + yNum * PIXELS_PER_SQUARE
    }

    distanceFrom (dot) {
      return [Math.abs(dot.xNum - this.xNum), Math.abs(dot.yNum - this.yNum)]
    }

    maxDistanceFrom (dot) {
      return Math.max(...this.distanceFrom(dot))
    }

    print () {
      return DotCache.key(this.xNum, this.yNum)
    }
  }

  class DotCache {
    static cache = {}

    static key (xNum, yNum) {
      return `[${xNum},${yNum}]`
    }

    static getDot (xNum, yNum) {
      const key = DotCache.key(xNum, yNum)

      if (key in DotCache.cache) {
        return DotCache.cache[key]
      } else {
        const dot = new Dot(xNum, yNum)
        DotCache.cache[key] = dot
        return dot
      }
    }
  }

  const LINE_STATES = ['hidden', 'hovered', 'filled']
  class Line {
    constructor (start, end) {
      if (!(start instanceof Dot && end instanceof Dot)) {
        throw new Error('Variable is not an instance of Dot class')
      }

      if (start.maxDistanceFrom(end) > 1) {
        throw new Error('Dots are too far apart')
      }

      this.start = start
      this.end = end
      this.state = 'hidden'
    }

    setState (newState) {
      if (LINE_STATES.includes(newState)) {
        this.state = newState
      }
    }

    static getAssociatedQuadrants (el) {
      // el should be part of this class instance already instead of passed in...
      const quad1 = el.parentElement

      let row = quad1.dataset.row
      let col = quad1.dataset.col
      if (el.classList.contains('left')) {
        col = col - 1
      } else if (el.classList.contains('top')) {
        row = row - 1
      } else if (el.classList.contains('right')) {
        col = col + 1
      } else if (el.classList.contains('bottom')) {
        row = row + 1
      }

      const quad2 = document.querySelector(`#game-board .quadrant[data-row="${row}"][data-col="${col}"]`)
      return [quad1, quad2].filter(Boolean)
    }
  }

  class LineCache {
    static cache = {}

    static key (start, end) {
      return `${start.print()},${end.print()}`
    }

    static getLine (start, end) {
      const key = LineCache.key(start, end)

      if (key in LineCache.cache) {
        return LineCache.cache[key]
      } else {
        const line = new Line(start, end)
        LineCache.cache[key] = line
        return line
      }
    }
  }

  class Quadrant {
    // constructor (xNum, yNum) {
    //   this.xNum = xNum
    //   this.yNum = yNum
    //   this.NW = DotCache.getDot(xNum, yNum)
    //   this.NE = DotCache.getDot(xNum + 1, yNum)
    //   this.SW = DotCache.getDot(xNum, yNum + 1)
    //   this.SE = DotCache.getDot(xNum + 1, yNum + 1)
    //   this.top = LineCache.getLine(this.NW, this.NE)
    //   this.right = LineCache.getLine(this.NE, this.SE)
    //   this.bottom = LineCache.getLine(this.SE, this.SW)
    //   this.left = LineCache.getLine(this.SW, this.NW)
    // }

    constructor (el) {
      this.el = el
      const row = el.dataset.row
      const col = el.dataset.col
      this.row = row
      this.col = col

      this.left = el.querySelector('.line.left')
      this.top = el.querySelector('.line.top')
      this.right = el.querySelector('.line.right')
      this.bottom = el.querySelector('.line.bottom')

      if (!this.right) {
        const quadRight = QuadrantCache.getQuadrantRight(el)
        this.right = quadRight.querySelector('.line.left')
      }

      if (!this.bottom) {
        const quadBottom = QuadrantCache.getQuadrantBottom(el)
        this.bottom = quadBottom.querySelector('.line.top')
      }

      this.lines = [this.left, this.top, this.right, this.bottom]

      // this.top = LineCache.getLine(this.NW, this.NE)
      // this.right = LineCache.getLine(this.NE, this.SE)
      // this.bottom = LineCache.getLine(this.SE, this.SW)
      // this.left = LineCache.getLine(this.SW, this.NW)
    }

    static markIfComplete (el) {
      if (el.classList.contains('complete')) {
        return false
      }
      const quad = QuadrantCache.getQuadrant(el)
      console.log(quad)

      const filter = quad.lines.filter((line) => {
        return line.classList.contains('filled')
      })

      const complete = filter.length === 4

      if (complete) {
        let playerClass = PLAYER_CLASSES[TURN_TICKER]
        el.classList.remove(...PLAYER_CLASSES)
        el.classList.add('complete', playerClass)
        POINTS.addPoint(TURN_TICKER)
      }

      console.log(`complete: ${complete}`)
      return complete

      // do the check
      // mark the quadrant as done
    }
  }

  class QuadrantCache {
    static cache = {}

    static key (el) {
      const row = el.dataset.row
      const col = el.dataset.col
      return `[${row},${col}]`
    }

    // static getQuadrant (xNum, yNum) {
    //   const key = QuadrantCache.key(xNum, yNum)

    //   if (key in QuadrantCache.cache) {
    //     return QuadrantCache.cache[key]
    //   } else {
    //     const quadrant = new Quadrant(xNum, yNum)
    //     QuadrantCache.cache[key] = quadrant
    //     return quadrant
    //   }
    // }

    static makeQuadrant (el) {
      const key = QuadrantCache.key(el)
      const quadrant = new Quadrant(el)
      QuadrantCache.cache[key] = quadrant
      el.dataset.key = key
      return quadrant
    }

    static getQuadrant (el) {
      const key = el.dataset.key
      return QuadrantCache.cache[key]
    }

    static getQuadrantRight (el) {
      const row = parseInt(el.dataset.row)
      const col = parseInt(el.dataset.col)

      const quad = document.querySelector(`.quadrant[data-row="${row}"][data-col="${col + 1}"]`)
      return quad
    }

    static getQuadrantBottom (el) {
      const row = parseInt(el.dataset.row)
      const col = parseInt(el.dataset.col)

      const quad = document.querySelector(`.quadrant[data-row="${row + 1}"][data-col="${col}"]`)
      return quad
    }

    static getByEl (el) {
      return QuadrantCache.getQuadrant(el.dataset.row, el.dataset.col)
    }
  }

  class Points {
    constructor (el) {
      this.points = {
        0: 0,
        1: 0
      }
      this.player0El = el.querySelector('.player0')
      this.player1El = el.querySelector('.player1')
    }

    addPoint(player) {
      this.points[player]++
      this.updateDom()
    }

    updateDom() {
      this.player0El.textContent = this.points[0]
      this.player1El.textContent = this.points[1]
    }
  }

  function init (gameBoard) {
    // gameBoard.querySelectorAll('.quadrant').forEach((quadrant) => {
    //   QuadrantCache.getQuadrant(quadrant.dataset.row, quadrant.dataset.col)
    // })

    POINTS = new Points(document.querySelector('#score-board'))

    gameBoard.querySelectorAll('.quadrant').forEach((quad) => {
      QuadrantCache.makeQuadrant(quad)
    })
  }

  function eventListeners (gameBoard) {
    gameBoard.addEventListener('click', (e) => {
      const target = e.target
      if (target.classList.contains('line')) {
        if (target.classList.contains('filled')) {
          console.log('line already filled')
        } else {
          let playerClass = PLAYER_CLASSES[TURN_TICKER]
          target.classList.remove(...PLAYER_CLASSES)
          target.classList.add('filled', playerClass)
          const quads = Line.getAssociatedQuadrants(target)
          const anyCompleted = quads.map((quad) => {
            return Quadrant.markIfComplete(quad)
          })
          // ugh messy
          if (anyCompleted.filter((a) => a).length) {
            console.log('user gets another turn')
          } else {
            console.log('switch turns')
            switchTurns()
          }

          let weDid = didWeWin()
          if (weDid) {
            console.log('game over!')
          } else {
            console.log('not done yet')
          }
        }
      }
    })
  }

  function switchTurns () {
    TURN_TICKER = Math.abs(TURN_TICKER - 1)
    
    const whoseTurnEl = document.querySelector('.whose-turn')
    const [player0El, player1El] = whoseTurnEl.querySelectorAll('span')

    if (player0El.getAttribute('aria-hidden') === 'true') {
      player0El.removeAttribute('aria-hidden')
      player1El.setAttribute('aria-hidden', true)
    } else {
      player1El.removeAttribute('aria-hidden')
      player0El.setAttribute('aria-hidden', true)
    }
  }

  function didWeWin () {
    return document.querySelectorAll('.quadrant:not(.complete)').length === 0
  }

  // function draw(canvas) {
  //   if (canvas.getContext) {
  //     const ctx = canvas.getContext("2d");

  //     for (let i = 0; i < BOARD_SIZE + 1; i++) {
  //       for (let j = 0; j < BOARD_SIZE + 1; j++) {
  //         ctx.beginPath();
  //         let x = BOARD_START_X + i * PIXELS_PER_SQUARE
  //         let y = BOARD_START_Y + j * PIXELS_PER_SQUARE

  //         ctx.arc(x, y, CIRCLE_RADIUS, 0, Math.PI * 2, true);
  //         ctx.fill();
  //       }
  //     }
  //   }
  // }

  // function eventListeners(canvas) {
  //   canvas.addEventListener('click', (e) => {
  //     let [start, end] = detectLine(e.offsetX, e.offsetY)
  //     drawLine('click', start, end);
  //   })
  // }

  // function detectLine(x, y) {
  //   console.log(x, y);
  //   return [Point.new(1, 1), Point.new(1, 2)]
  // }

  // function drawLine(type, startPoint, endPoint) {
  //   // console.log(start, end);

  //   const ctx = canvas.getContext("2d");
  //   ctx.beginPath();
  //   ctx.moveTo(startPoint.x, startPoint.y);
  //   ctx.lineTo(endPoint.x, endPoint.y);
  //   ctx.closePath();
  // }
})()
