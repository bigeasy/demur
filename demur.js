var Signal = require('signal')
var cadence = require('cadence')
var seedrandom = require('seedrandom')

function Demur (options) {
    options || (options = {})
    this._retries = options.retires || Infinity
    this._factor = options.factor || 2
    this._delay = options.delay || 0
    this._minimum = options.minimum || 1000
    this._maximum = options.maximum || Infinity
    this._reset = options.reset || Infinity
    this._Date = options.Date || Date
    this._random = options.randomize
                 ? seedrandom(options.seed || this._Date.now())
                 : function () { return 0.5 }
    this._lastChecked = options.reset == null ? 0 : this._Date.now() - options.reset - 1
    this._duration = this._minimum
    this._attempt = 0
    this._retrying = new Signal
}

Demur.prototype._retry = function (random) {
    var now = this._Date.now()
    if (this.cancelled || ++this._attempt > this._retries) {
        this.cancelled = true
        return 0
    }
    var since = now - this._lastChecked
    this._lastChecked = now
    if (since >= this._reset) {
        this.reset()
        return this._delay
    }
    var duration = this._duration
    this._duration = Math.min(this._factor * this._duration, this._maximum)
    return Math.round(duration * (1 + (random() - 0.5)))
}

Demur.prototype.retry = cadence(function (async) {
    async(function () {
        var duration = this._retry(this._random)
        if (duration != 0) {
            this._retrying.wait(async())
            this._timeout = setTimeout(this._retrying.notify.bind(this._retrying), duration)
        }
    }, function () {
        this._timeout = null
        return ! this.cancelled
    })
})

Demur.prototype.reset = function () {
    this._duration = this._minimum
    this._attempt = 0
}

Demur.prototype.cancel = function () {
    this.cancelled = true
    if (this._timeout != null) {
        this._retrying.notify()
        clearTimeout(this._timeout)
    }
}

module.exports = Demur
