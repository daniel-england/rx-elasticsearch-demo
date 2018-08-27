const elasticsearch = require('elasticsearch');
const rx = require('rxjs/Rx');

const bulkSize = 50;
const bulksPerSecond = 25;

const defaultClient = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'warning'
});

const scrollToEnd = (res, scroll, batchSize, client, observer) => {
    if (res.timed_out) {
        return observer.error(new Error('Search timed out'));
    }

    const emitHits = hits =>
        hits.map(hit => hit._source)
            .forEach(source => observer.next(source));

    const hits = res.hits.hits;
    const scrollId = res._scroll_id;
    if (hits.length < batchSize) {
        if (hits.length > 0) {
            emitHits(hits);
        }

        observer.complete();
        if (scrollId) client.clearScroll({scrollId})
            .catch(console.error);
        return;
    }

    emitHits(hits);

    if (!observer.completed) {
        client.scroll({scroll, scrollId})
            .then(batchRes => scrollToEnd(batchRes, scroll, batchSize, client, observer))
            .catch(observer.error);
    }
};

const streamAll = client => searchBody => {
    const defaults = {
        size: 20,
        scroll: '30s'
    };
    const body = Object.assign({}, defaults, searchBody);
    return new rx.Observable.create(observer => {
        let completed = false;
        client.search(body)
            .then(res => scrollToEnd(res, body.scroll, body.size, client, observer))
            .catch(error => observer.error(error));
        return () => observer.completed = true;
    });
};

const bulkUpdate = client => observable => {
    return observable
        .bufferCount(bulkSize)
        .concatMap(records => rx.Observable.timer(1000/bulksPerSecond).map(() => records))
        .mergeMap(records =>
            rx.Observable.defer(() => {
                const body = [];

                records.forEach(record => {
                    body.push({index: {_index: record._index, _type: record._type, _id: record._id}});
                    body.push(record._source);
                });

                return client.bulk({body});
            }).do(results => {
                if (results.errors) {
                    console.error(`bulk had errors: ${records[0]._id}`);
                    throw 'Bulk had errors';
                }
            }).retryWhen(errors => errors.delay(5000).take(5).concat(rx.Observable.throwError('Failed to retry')))
        );
};

module.exports = (client) => {
    const _client = client || defaultClient;

    const module = {};

    module.streamAll = streamAll(_client);
    module.bulkUpdate = bulkUpdate(_client);

    return module;
};