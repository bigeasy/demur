var Signal = require('signal')
var cadence = require('cadence')
var seedrandom = require('seedrandom')
var coalesce = require('extant')

function Demur (options) {
    options || (options = {})
    this._retries = coalesce(options.retires, Infinity)
    this._factor = coalesce(options.factor, 2)
    this._delay = coalesce(options.delay, 0)
    this._immediate = coalesce(options.immediate, false)
    this._minimum = coalesce(options.minimum, 1000)
    this._maximum = coalesce(options.maximum, Infinity)
    this._reset = coalesce(options.reset, Infinity)
    this._Date = coalesce(options.Date, Date)
    this._random = options.randomize
                 ? seedrandom(options.seed || this._Date.now())
                 : function () { return 0.5 }
    this._lastChecked = options.reset == null ? 0 : this._Date.now() - options.reset - 1
    this._retrying = new Signal
    this.reset()
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
    if (this._attempt == 1 && this._immediate) {
        this._duration = this._minimum
    } else {
        this._duration = Math.min(this._factor * this._duration, this._maximum)
    }
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
    this._duration = this._immediate ? 0 : this._minimum
    this._attempt = 0
}

Demur.prototype.cancel = function () {
    this.cancelled = true
    if (this._timeout != null) {
        clearTimeout(this._timeout)
        this._retrying.notify()
    }
}

module.exports = Demur
