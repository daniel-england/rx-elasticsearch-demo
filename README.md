# rxjs-elasticsearch

This project shows how to use rxjs to stream all elasticsearch results using express js.

# Running Locally

This project uses docker-compose to launch an elasticsearch instance locally.  To launch it:

```
$ docker-compose up -d
```

To generate data for testing: 

```
$ npm run generate -- 1000
```
This will create 1000 index records and put them in a 'widget' index that will the following attributes:
```
{
  name: "Financial Toast", // random words
  color: "blue", // one of ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'brown', 'black']
  date: "2018-05-12T14:32:19.034Z", // random date/time
  cost: 135.67, // random number
  fooable: true, // random boolean
  quantity: 1159 // random integer
}
```

To start the express server on port 3000.

```
$ npm run start
```

Then run your query using elasticsearch `q` query string.

`http://localhost:3000/search?q=color:blue`