var exec = require('child_process').exec;

var pipe = false;
var map = false;

function omx(mapper) {
    map = mapper;
}

omx.stop = function(cb) {
    if (!pipe) {
        cb();
        return;
    }
    console.info('killing omxplayer..');
    exec('rm -f'+pipe, function (error, stdout, stderr) {
        if (error !== null) console.error('rm exec error: ' + error);
        pipe = false;
        exec('killall omxplayer.bin', cb);
    });
};

omx.start = function(fn) {
    if (!pipe) {
        pipe = '/tmp/omxcontrol';
        exec('rm -f '+pipe, function (error, stdout, stderr) {
            if (error !== null) {
                console.error('rm exec error: ' + error);
            } else {
                exec('mkfifo '+pipe, function (error, stdout, stderr) {
                    if (error !== null) {
                        console.error('mkfifo exec error: ' + error);
                    } else {
                        if (map) {
                            map(fn,cb);
                        } else {
                            cb(fn);
                        }
                    }
                });
            }
        });
    } else {
        console.info("Pipe already exists! Restarting...");
        omx.stop(function () {
            return omx.start(fn);
        });
    }

    function cb(fn) {
        console.info(fn);
        exec('omxplayer -o hdmi "'+fn+'" < '+pipe, function (error, stdout, stderr) {
            if (error !== null) {
              console.error('omxplayer exec error: ' + error);
            }
        });
        omx.sendKey('.') // play
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
    omx.stop();
});
omx.mapKey('play','.');
omx.mapKey('forward',"\x5b\x43");
omx.mapKey('backward',"\x5b\x44");
omx.mapKey('subs', 'm');

module.exports = omx;
