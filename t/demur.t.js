require('proof')(4, require('cadence')(prove))

function prove (async, assert) {
    var Demur = require('..'), time = 1000, demur
    demur = new Demur
    demur = new Demur({
        randomize: true,
        Date: { now: function () { return time } }
    })
    assert(demur._retry(demur._random), 608, 'rng delay')
    demur = new Demur({
        reset: 1000,
        Date: { now: function () { return time } }
    })
    async(function () {
        demur.retry(async())
    }, function (again) {
        assert(again, 'no wait')
        demur.retry(async())
    }, function (again) {
        assert(again, 'waited')
        demur.retry(async())
        demur.cancel()
    }, function (again) {
        assert(! again, 'cancelled')
        demur.retry(async())
        demur.cancel()
    }, function (again) {
        assert(! again, 'still cancelled')
    })
}
