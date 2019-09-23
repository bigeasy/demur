const coalesce = require('extant')
const Calculator = require('./calculator')

class Demur {
    constructor (options) {
        options = coalesce(options, {})
        this.canceled = false
        this._calculator = new Calculator(options)
        this._retries = coalesce(options.attempts, Infinity)
        this._resolve = () => {}
        this._timeout = null
    }

    async demur () {
        if (this.canceled || this._calculator.attempt == this._retries) {
            this.canceled = true
            return false
        }
        const duration = this._calculator.duration()
        if (duration != 0) {
            await new Promise(resolve => {
                this._timeout = setTimeout(this._resolve = resolve, duration)
            })
        }
        return ! this.canceled
    }

    reset () {
        this._calculator.reset()
        this.canceled = false
    }

    cancel () {
        this.canceled = true
        clearTimeout(this._timeout)
        this._resolve.call()
    }
}

module.exports = Demur
