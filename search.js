const client = require('./rx-es-client')();
const rx = require('rxjs/Rx');

const writeToRes = res => {
    const subject = new rx.Subject();

    subject.skip(1).subscribe(() => res.write(','));

    subject.startWith('[')
        .finally(() => {
            res.write(']');
            res.end();
        })
        .subscribe(x => res.write(x));

    return subject;
};


module.exports = (req, res) => {
    let results = client.streamAll({
        index: 'widget',
        q: req.query.q
    }).map(JSON.stringify);

    if (req.query.size) {
        results = results.take(req.query.size);
    }

    results.subscribe(writeToRes(res));
};