var context = {
    queue: {},

    on: function(event, cb) {
        if ( !this.queue.hasOwnProperty(event) )
            this.queue[event] = [];
        this.queue[event].push(cb);

        return this;
    },

    succeed: function (reason) {
        this.queue.success.map(function successCalls(cb) {
            return cb(reason);
        });
    },

    fail: function (reason) {
        this.queue.fail.map(function successCalls(cb) {
            return cb(reason);
        });
    }
};

module.exports = context;
