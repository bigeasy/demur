var Signal = require('signal')
var cadence = require('cadence')
var coalesce = require('extant')

var Calculator = require('./calculator')

function Demur (options) {
    options = coalesce(options, {})
    this._calculator = new Calculator(options)
    this._retries = coalesce(options.retries, Infinity)
    this._retrying = new Signal
}

Demur.prototype._demur = function (retrying, duration) {
    this._timeout = setTimeout(function () { retrying.notify() }, duration)
}

Demur.prototype.retry = cadence(function (async) {
    if (this.cancelled || this._calculator.attempt == this._retries) {
        this.cancelled = true
        return false
    }
    async(function () {
        var duration = this._calculator.duration()
        if (duration != 0) {
            this._retrying.wait(async())
            this._demur(this._retrying, duration)
        }
    }, function () {
        this._timeout = null
        return ! this.cancelled
    })
})

Demur.prototype.reset = function () {
    this._calculator.reset()
    this.cancelled = false
}

Demur.prototype.cancel = function () {
    this.cancelled = true
    if (this._timeout != null) {
        clearTimeout(this._timeout)
        this._retrying.notify()
    }
}

module.exports = Demur
