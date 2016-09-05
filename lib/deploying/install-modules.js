var spawn = require('child_process').spawnSync;

/**
 * Runs `npm install` to ensure that all of the node modules get bundled.
 * (This is required so they can be sent up to/used once its on AWS)
 * @param {Function} cb - The callback function.
 * @returns {Function} An instance of the callback function.
 * @todo: Figure out why the output buffer wasn't
 *        converting to a string correctly so the
 *        user can see the npm install output.
 */
module.exports = function installModules(cb) {
    console.log('Installing npm modules.');
    var npm = spawn('npm', ['install']);
    return cb();
};
