const w = 500, h = 500, nodes = 5
const GifEncoder = require('gifencoder')
const Canvas = require('canvas')
class State {
    constructor() {
        this.scale = 0
        this.dir = 0
        this.prevScale = 0
    }

    update(cb) {
        this.scale += this.dir * 0.1
        console.log(this.scale)
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating() {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
        }
    }
}

class ArrowMoverNode {
    constructor(i) {
        this.i = i
        this.state = new State()
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new ArrowMoverNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context) {
        const gap = w / nodes
        var sc1 = Math.min(0.5, this.state.scale) * 2
        const sc2 = Math.min(0.5, Math.max(0, this.state.scale - 0.5)) * 2
        const index = this.i % 2
        sc1 = (1 - index) * sc1 + (1 - sc1) * index
        context.strokeStyle = 'white'
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / 60
        context.save()
        context.translate(this.i * gap + gap * sc2, h/2)
        context.beginPath()
        context.moveTo(-gap/3, 0)
        context.lineTo(gap / 3, 0)
        context.stroke()
        for(var i = 0; i < 2; i++) {
            context.save()
            context.translate(gap/3, 0)
            context.rotate(Math.PI/4 * sc1 * (1 - 2 * i))
            context.beginPath()
            context.moveTo(0, 0)
            context.lineTo(gap/5 - gap/3, 0)
            context.stroke()
            context.restore()
        }
        context.restore()
        if (this.next) {
            this.next.draw(context)
        }
    }

    update(cb) {
        this.state.update(() => {
            cb()
        })
    }

    startUpdating() {
        this.state.startUpdating()
    }

    getNext(dir, cb) {
        var curr = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class LinkedArrowMover {
    constructor() {
        this.curr = new ArrowMoverNode(0)
        this.dir = 1
    }

    draw(context) {
        this.curr.draw(context)
    }

    update(cb) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            if (this.curr.i == 0 && this.dir == 1) {
                cb()
            }
            else {
                this.startUpdating()
            }
        })
    }

    startUpdating() {
        this.curr.startUpdating()
    }
}

class Renderer {
    constructor() {
        this.running = true
        this.arrowMover = new LinkedArrowMover()
        this.arrowMover.startUpdating()
    }

    render(context, cb, endcb) {
        while (this.running) {
            context.fillStyle = '#212121'
            context.fillRect(0, 0, w, h)
            this.arrowMover.draw(context)
            cb(context)
            this.arrowMover.update(() => {
                endcb()
                this.running = false
            })
        }
    }
}

class LinkedArrowMoverGif {
    constructor(fn) {
        this.renderer = new Renderer()
        this.encoder = new GifEncoder(w, h)
        this.canvas = new Canvas(w, h)
        this.initEncoder(fn)
        this.render()
    }

    initEncoder(fn) {
        this.encoder.createReadStream().pipe(require('fs').createWriteStream(fn))
        this.encoder.setRepeat(0)
        this.encoder.setDelay(50)
        this.context = this.canvas.getContext('2d')
    }

    render() {
        this.encoder.start()
        this.renderer.render(this.context, (ctx) => {
            this.encoder.addFrame(ctx)
        }, () => {
            this.encoder.end()
        })
    }

    static init(fn) {
        const gif = new LinkedArrowMoverGif(fn)
    }
}
module.exports = LinkedArrowMoverGif.init
