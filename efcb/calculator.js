var coalesce = require('extant')
var seedrandom = require('seedrandom')

function Calculator (options) {
    this._factor = coalesce(options.factor, 2)
    this._delay = coalesce(options.delay, 0)
    this._immediate = coalesce(options.immediate, false)
    this._minimum = coalesce(options.minimum, 1000)
    this._maximum = coalesce(options.maximum, Infinity)
    this._random = options.randomize
                 ? seedrandom(coalesce(options.seed, Date.now()))
                 : function () { return 0.5 }
    this.reset()
}

Calculator.prototype.duration = function () {
    var duration = this._duration
    if (this.attempt == 0 && this._immediate) {
        this._duration = this._minimum
    } else {
        this._duration = Math.min(this._factor * this._duration, this._maximum)
    }
    this.attempt++
    return Math.round(duration * (1 + (this._random.call(null) - 0.5)))
}

Calculator.prototype.reset = function () {
    this._duration = this._immediate ? 0 : this._minimum
    this.attempt = 0
}

module.exports = Calculator
