const client = require('./rx-es-client')();
const rx = require('rxjs/Rx');

const writeToRes = res => ({
    next: x => res.write(x),
    error: err => console.error(err),
    complete: () => res.end()
});

const emitComma = observable =>
    observable
        .mapTo(',')
        .skipLast(1)
        .concat(rx.Observable.of(''));

module.exports = (req, res) => {
    let results = client.streamAll({
        index: 'widget',
        q: req.query.q
    }).map(JSON.stringify);

    if (req.query.size) {
        results = results.take(req.query.size);
    }

    const response = rx.Observable.of('[')
        .concat(results.zip(emitComma(results), (result, postix) => result.concat(postix)))
        .concat(rx.Observable.of(']'));

    response.subscribe(writeToRes(res));
};