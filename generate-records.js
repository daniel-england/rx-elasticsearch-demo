const elasticsearch = require('elasticsearch');
const rx = require('rxjs/Rx');
const faker = require('faker');

const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'brown', 'black'];

const client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace'
});

const numToCreate = process.argv[2];

if (!numToCreate) throw new Error('"Number to create required: "npm run generate -- [numToCreate]"');

const observable = rx.Observable.range(1, numToCreate);

observable.subscribe(id => {
    client.create({
        index: 'widget',
        type: 'foo',
        id,
        body: {
            name: faker.random.words(),
            color: faker.random.arrayElement(colors),
            date: faker.date.recent(),
            cost: faker.finance.amount(),
            fooable: faker.random.boolean(),
            quantity: faker.random.number()
        }
    });
});