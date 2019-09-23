describe('demur', () => {
    const assert = require('assert')
    const Demur = require('..')
    it('can continue immediately at first', async () => {
        const when = Date.now()
        const demur = new Demur({ attempts: 2 })
        assert(await demur.demur(), 'continue')
        assert(Date.now() - when < 25, 'immediate')
        demur.cancel()
        assert(!await demur.demur(), 'stop')
    })
    it('can demur', async () => {
        const when = Date.now()
        const demur = new Demur({ attempts: 2, minimum: 25 })
        assert(await demur.demur(), 'continue')
        assert(Date.now() - when < 24, 'immediate')
        assert(await demur.demur(), 'continue')
        assert(Date.now() - when > 24, 'demurred')
    })
    it('can give up', async () => {
        const when = Date.now()
        const demur = new Demur({ attempts: 1, minimum: 25 })
        assert(await demur.demur(), 'continue')
        assert(Date.now() - when < 25, 'immediate')
        assert(!await demur.demur(), 'stop')
        assert(demur.canceled, 'canceled')
    })
    it('can reset', async () => {
        const when = Date.now()
        const demur = new Demur({ attempts: 1, minimum: 25 })
        assert(await demur.demur(), 'continue')
        demur.reset()
        assert(Date.now() - when < 25, 'immediate')
        assert(await demur.demur(), 'continue')
        demur.cancel()
        assert(demur.canceled, 'canceled')
    })
    it('can cancel', async () => {
        const when = Date.now()
        const demur = new Demur({ immediate: false, attempts: 1, minimum: 30000 })
        const promise = demur.demur()
        demur.cancel()
        assert(!await promise, 'stop')
        assert(Date.now() - when < 25, 'timer stopped')
        assert(demur.canceled, 'canceled')
    })
    it('can work as a function', async () => {
        const demur = Demur.demur
        assert.equal(await demur({}, async () => 1), 1, 'as function')
    })
    it('can result a default as a function', async () => {
        const demur = Demur.demur
        assert.equal(await demur({ retries: 1, default: 0 }, () => {
            throw new Error
        }), 0, 'return default')
    })
    it('can log an error', async () => {
        const demur = Demur.demur
        const test = []
        await demur({ retries: 1, default: 0 }, () => {
            throw new Error('thrown')
        }, (error) => test.push(error.message))
        assert.deepStrictEqual(test, [ 'thrown' ], 'log error')
    })
    it('can bail', async () => {
        const demur = Demur.demur
        const test = []
        assert.equal(await demur({ retries: 1, default: 0 }, () => {
            demur.bail()
        }), null, 'bail')
    })
    it('can bail with a value', async () => {
        const demur = Demur.demur
        const test = []
        assert.equal(await demur({ retries: 1, default: 0 }, () => {
            demur.bail(2)
        }), 2, 'bail')
    })
})
