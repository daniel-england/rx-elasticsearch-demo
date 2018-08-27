const elasticsearch = require('elasticsearch');
const rx = require('rxjs/Rx');
const faker = require('faker');
const rxEsClient = require('./rx-es-client');

const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'brown', 'black'];

const client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'warning'
});

const numToCreate = process.argv[2];

if (!numToCreate) throw new Error('"Number to create required: "npm run generate -- [numToCreate]"');

const observable = rx.Observable.range(1, numToCreate)
    .map(id =>
        ({
            _index: 'widget',
            _type: 'foo',
            _id: id,
            _source: {
                name: faker.random.words(),
                color: faker.random.arrayElement(colors),
                date: faker.date.recent(),
                cost: faker.finance.amount(),
                fooable: faker.random.boolean(),
                quantity: faker.random.number()
            }
        }));

rxEsClient(client)
    .bulkUpdate(observable)
    .subscribe(result => {
        //console.log(JSON.stringify(result));
    }, err => console.error(err));