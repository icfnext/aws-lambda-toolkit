var spawn = require('child_process').spawnSync;

/**
 * @todo: Figure out why the output buffer wasn't
 *        converting to a string correctly so the
 *        user can see the npm install output.
 */
module.exports = function installModules(cb) {
    console.log('Installing npm modules.');
    var npm = spawn('npm', ['install']);
    return cb();
};
