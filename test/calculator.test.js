describe('calculator', () => {
    const assert = require('assert')
    const Calculator = require('../calculator')
    it('can randomize backoff', () => {
        const calculator = new Calculator({ randomize: true, seed: 0 })
        assert.equal(calculator.duration(), 538, 'randomized')
    })
})
