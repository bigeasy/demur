require('proof')(7, require('cadence')(prove))

function prove (async, okay) {
    var Demur = require('../demur')
    var demur = new Demur({ immediate: true, retries: 2 }), when
    async(function () {
        when = Date.now()
        demur.retry(async())
    }, function () {
        okay(Date.now() - when < 999, 'immediate')
        demur.retry(async())
        when = Date.now()
    }, function () {
        okay(Date.now() - when >= 1000, 'delayed')
        when = Date.now()
        demur.retry(async())
    }, function (kosher) {
        okay(! kosher, 'retry exhaustion')
        demur.retry(async())
    }, function (kosher) {
        okay(! kosher, 'already cancelled')
        demur.reset()
        demur.retry(async())
        when = Date.now()
    }, function (kosher) {
        okay(Date.now() - when < 999, 'reset immediate')
        okay(kosher, 'restored')
        demur.retry(async())
        setTimeout(function () { demur.cancel() }, 250)
    }, function (kosher) {
        okay(! kosher, 'cancel while waiting')
        demur.cancel()
    })
}
