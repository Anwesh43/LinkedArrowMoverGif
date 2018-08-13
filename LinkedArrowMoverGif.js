const w = 500, h = 500, nodes = 5
class State {
    constructor() {
        this.scale = 0
        this.dir = 0
        this.prevScale = 0
    }

    update(cb) {
        this.scale += this.dir * 0.1
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
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
        var sc2 = (1 - index) * sc2 + (1 - sc2) * index
        context.strokeStyle = 'white'
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / 60
        context.save()
        context.tranlsate(this.i * gap + gap * sc2, h/2)
        context.beginPath()
        context.moveTo(-gap/3, 0)
        context.lineTo(gap / 3, 0)
        context.stroke()
        for(var i = 0; i < 2; i++) {
            context.save()
            context.rotate(Math.PI/4 * sc2 * (1 - 2 * i))
            context.beginPath()
            context.moveTo(gap/3, 0)
            context.lineTo(gap/5, 0)
            context.stroke()
            context.restore()
        }
        context.restore()
    }

    update(cb) {
        this.state.update(cb)
    }

    startUpdating(cb) {
        this.state.startUpdating(cb)
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
