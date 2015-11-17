var spawn = require('child_process').spawnSync;

module.exports = function installModules(cb) {
    console.log('Installing npm modules.');
    var npm = spawn('npm', ['install']);
    return cb();
};
