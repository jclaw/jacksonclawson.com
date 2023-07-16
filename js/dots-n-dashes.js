(function () {
  window.addEventListener('DOMContentLoaded', () => {
    const gameKeyInURL = false
    if (gameKeyInURL) {
      loadGameFromServer(gameKeyInURL)
    } else {
      initLoadScreen()
    }
  })

  let TURN_TICKER = 0
  const PLAYER_CLASSES = ['player0', 'player1']
  let POINTS

  class Line {
    static getAssociatedQuadrants (el) {
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

  class Quadrant {
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
        const playerClass = PLAYER_CLASSES[TURN_TICKER]
        el.classList.remove(...PLAYER_CLASSES)
        el.classList.add('complete', playerClass)
        POINTS.addPoint(TURN_TICKER)
      }

      console.log(`complete: ${complete}`)
      return complete
    }
  }

  class QuadrantCache {
    static cache = {}

    static key (el) {
      const row = el.dataset.row
      const col = el.dataset.col
      return `[${row},${col}]`
    }

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

    addPoint (player) {
      this.points[player]++
      this.updateDom()
    }

    updateDom () {
      this.player0El.textContent = this.points[0]
      this.player1El.textContent = this.points[1]
    }
  }

  function initLoadScreen () {
    const loadScreen = document.querySelector('.load-screen')
    const newGameButton = loadScreen.querySelector('.new-game')
    const loadGameButton = loadScreen.querySelector('.load-game')
    const loadGameField = loadScreen.querySelector('input')

    newGameButton.addEventListener('click', () => {
      // TODO
      // ask server for new key
      // redirect user to game URL in waiting state
      // give user the invite URL
      // set up WebSocket (?) to watch for the event when the other player opens the link

      startGame()
      loadScreen.style.display = 'none'
    })

    loadGameButton.addEventListener('click', () => {
      // TODO: validation and error states
      loadGameFromServer(loadGameField.value)
      loadScreen.style.display = 'none'
    })

    loadScreen.style.display = 'block'
  }

  function loadGameFromServer (gameKey) {
    // TODO
    let gameData
    startGame(gameData)
  }

  function startGame (gameData = null) {
    const gameBoard = document.getElementById('game-board')
    init(gameBoard)
    eventListeners(gameBoard)
    document.querySelector('.game').style.display = 'block'
  }

  function init (gameBoard) {
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
          const playerClass = PLAYER_CLASSES[TURN_TICKER]
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

          const weDid = didWeWin()
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
})()
