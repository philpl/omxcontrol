var exec = require('child_process').exec;
var parseurl = require('url');

var pipe = false;
var map = false;
var DEFAULT_PATH = '/omx';

function omx(mapper) {
    map = mapper;
}

omx.stop = function(cb) {
    if (!pipe) {
        cb();
        return;
    }
    console.log('killing omxplayer..');
    exec('rm '+pipe, function () {
        pipe = false;
        exec('killall omxplayer.bin', cb);
    });
};

omx.start = function(fn) {
    if (!pipe) {
        pipe = 'omxcontrol';
        exec('mkfifo '+pipe);
    } else {
        console.log("Pipe already exists! Restarting...");
        omx.stop(function () {
            return omx.start(fn);
        });
    }
    if (map) {
        map(fn,cb);
    } else {
        cb(fn);
    }

    function cb(fn) {
        console.log(fn);
        exec('omxplayer -o hdmi "'+fn+'" < '+pipe,function(error, stdout, stderr) {
            console.log(stdout);
        });
        exec('echo . > '+pipe);
    }
};

omx.sendKey = function(key) {
    if (!pipe) return;
    exec('echo -n '+key+' > '+pipe);
};

omx.mapKey = function(command,key,then) {
    omx[command] = function() {
        omx.sendKey(key);
        if (then) {
            then();
        }
    };
};

omx.mapKey('volume_up', '+');
omx.mapKey('volume_down', '-');
omx.mapKey('pause','p');
omx.mapKey('quit','q',function() {
    exec('rm '+pipe);
    pipe = false;
});
omx.mapKey('play','.');
omx.mapKey('forward',"\x5b\x43");
omx.mapKey('backward',"\x5b\x44");
omx.mapKey('subs', 'm');

module.exports = omx;
