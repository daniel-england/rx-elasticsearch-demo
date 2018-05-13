const client = require('./rx--es-client')();
const rx = require('rxjs/Rx');

module.exports = (req, res) => {
    console.log(req.query.q);
    const subject = new rx.Subject();
    subject.skip(1).subscribe(() => res.write(','));
    subject.subscribe(searchRes => {
        const batchResults = searchRes.hits.hits;
        res.write(batchResults.map(match => JSON.stringify(match._source)).join());
    });

    //const search = scroll();

    const observable = client.streamAll({
        index: 'widget',
        q: req.query.q
    }).finally(() => {
        res.write(']');
        res.end();
    });

    res.write('[');
    observable.subscribe(subject);
};