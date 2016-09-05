/**
 * Emulated AWS context
 */
var context = {
    // Queue for events
    queue: {},

    // Boolean dictating whether or not the context has been fired yet
    // (for ensuring the correct event is fired once and only once)
    contextHappened: false,

    /**
     * Pushes a callback into the event queue.
     * @param {String} event - The event name
     * @param {Function} cb - The callback to use for the event.
     * @returns {Object} The context object
     */
    on: function(event, cb) {
        if ( !this.queue.hasOwnProperty(event) )
            this.queue[event] = [];

        this.queue[event].push(cb);

        return this;
    },

    /**
     * Resets the context. Used to reset the context after firing a test case.
     */
    reset: function() {
        this.contextHappened = false;
    },

    /**
     * Function success handler. Fires off the success callback.
     * @param {String} reason - The reason for the functions success.
     * @returns {Function} An invocation of the success callback.
     */
    succeed: function (reason) {
        if (!this.contextHappened) {
            this.contextHappened = 200;
            return this.queue.success.shift()(reason);
        }
    },

    /**
     * Function failure handler. Fires off the failure callback.
     * @param {String} reason - The reason for the functions failure.
     * @returns {Function} An invocation of the failure callback.
     */
    fail: function (reason) {
        if (!this.contextHappened) {
            this.contextHappened = 500;
            return this.queue.fail.shift()(reason);
        }
    }
};

module.exports = context;
