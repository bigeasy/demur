require('proof')(1, prove)

function prove (okay) {
    var Calculator = require('../calculator')
    var calculator = new Calculator({ randomize: true, seed: 0 })
    okay(calculator.duration(), 538, 'randomized')
}
