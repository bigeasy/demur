const delay = require('delay')
const coalesce = require('extant')
const Calculator = require('./calculator')

class Demur {
    constructor (options) {
        options = coalesce(options, {})
        this.canceled = false
        this._calculator = new Calculator(options)
        this._retries = coalesce(options.attempts, Infinity)
        this._deferral = delay(0)
    }

    async demur () {
        if (this.canceled || this._calculator.attempt == this._retries) {
            this.canceled = true
            return false
        }
        const duration = this._calculator.duration()
        if (duration != 0) {
            await (this._deferral = delay(duration))
        }
        return ! this.canceled
    }

    reset () {
        this._calculator.reset()
        this.canceled = false
    }

    cancel () {
        this.canceled = true
        this._deferral.clear()
    }
}

module.exports = Demur
