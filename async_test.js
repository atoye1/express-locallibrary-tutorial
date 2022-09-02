const async = require('async');

async.parallel({
    one(callback) {
        callback(null, 'one');
    },
    two(callback) {
        callback(null, 'two');
    },
    three(callback) {
        callback(null, 'three');
    },
}, (err, results) => {
    console.log(results); // {one:'one', two:'two', three:'three'}
});