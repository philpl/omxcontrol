omxcontrol
==========

Nodejs module to control omxplayer. Specifically written for the raspberry pi

Requirements
------------

* omxplayer (installed by default on the raspberry pi raspian image)
* nodejs (`apt-get install nodejs`)

Install
-------

    npm install omxcontrol

Usage
-----

Basic usage
    
    omx = require('omxcontrol');

    omx.start(filename);

    omx.pause();
    
    omx.volume_up();

    omx.volume_down();

    omx.quit();

You actually might not want to pass the real file name to the http api, probably to simplify things, but in my case, omxplayer needs a specific url to play youtube video. For this usecase, `omx()` can be passed a mapping function to map the filename to something else. Calling the provided start method is required to actually start the video. Your logic can be async and even choose not to start things:

    omx = require('omxcontrol');
    omx(function(fn,start) {
        //do something special
        start(fn);
    });
