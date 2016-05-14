var context = {
    queue: {},
    contextHappened: false,

    on: function(event, cb) {
        if ( !this.queue.hasOwnProperty(event) )
            this.queue[event] = [];

        this.queue[event].push(cb);

        return this;
    },

    reset: function() {
        this.contextHappened = false;
    },

    succeed: function (reason) {
        if (!this.contextHappened) {
            this.contextHappened = true;
            return this.queue.success.shift()(reason);
        }
    },

    fail: function (reason) {
        if (!this.contextHappened) {
            this.contextHappened = true;
            return this.queue.fail.shift()(reason);
        }
    }
};

module.exports = context;
