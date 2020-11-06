// This is stage 1, it can be changed but you must bump the version of the project.
// Note: This must only be loaded from inside of a sandbox-iframe.
define([
    '/common/requireconfig.js',
    '/common/test.js'
], function (RequireConfig, Test) {
    require.config(RequireConfig());

    // most of CryptPad breaks if you don't support isArray
    if (!Array.isArray) {
        Array.isArray = function(arg) { // CRYPTPAD_SHIM
            return Object.prototype.toString.call(arg) === '[object Array]';
        };
    }

    // RPC breaks if you don't support Number.MAX_SAFE_INTEGER
    if (Number && !Number.MAX_SAFE_INTEGER) {
        Number.MAX_SAFE_INTEGER = 9007199254740991;
    }

    var mkFakeStore = function () {
        var fakeStorage = {
            getItem: function (k) { return fakeStorage[k]; },
            setItem: function (k, v) { fakeStorage[k] = v; return v; },
            removeItem: function (k) { delete fakeStorage[k]; }
        };
        return fakeStorage;
    };
    window.__defineGetter__('localStorage', function () { return mkFakeStore(); });
    window.__defineGetter__('sessionStorage', function () { return mkFakeStore(); });

    window.CRYPTPAD_INSIDE = true;

    // This test is for keeping the testing infrastructure operating
    // until all tests have been registered.
    // This test is completed in common-interface.js
    Test(function (t) { Test.__ASYNC_BLOCKER__ = t; });

    window.onerror = function (e) {
        if (/requirejs\.org/.test(e)) {
            console.log();
            console.error("Require.js threw a Script Error. This probably means you're missing a dependency for CryptPad.\nIt is recommended that the admin of this server runs `bower install && bower update` to get the latest code, then modify their cache version.\nBest of luck,\nThe CryptPad Developers");
            return void console.log();
        }
        if (window.CryptPad_loadingError) {
            return void window.CryptPad_loadingError(e);
        }
        throw e;
    };

var crazyDebug = true;
if (crazyDebug) {
    var getLogElement = function () {
        var logger = document.querySelector('#cp-logger');
        if (logger) { return logger; }
        logger = document.createElement('div');
        logger.setAttribute('id', 'cp-logger');

        document.body.appendChild(logger);

    var css = function(){/*
#cp-logger {
    display: block;
    position: fixed;
    top: 25vh;
    height: 100vh;
    width: 100vw;
    z-index: 100000000;
}
#cp-logger pre {
    border: 1px solid red;
}
    */}.toString().slice(14, -3);

        var style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);

        return logger;
    };

    var c = console;
    window.console = new Proxy(c, {
        get: function (o, k) {
            if (k === 'error') {
                return function () {
                    var args = Array.prototype.slice.call(arguments);
                    c.error.apply(null, args);

                    var e = args[0];
                    //if (!e) { return; }

                    var pre = document.createElement('pre');

                    pre.innerText = JSON.stringify({
                        //origin: window.location.href,
                        message: e.message,
                        stack: e.stack.replace(/\\n/g, '\n'),
                        code: e.code,
                        raw: e,
                    }, null, 2).replace(/\\n/g, '\n');
                    getLogElement().appendChild(pre);
                    //document.body.appendChild(pre);
                };
            }
            return o[k];
        },
    });
    //try { throw new Error('oops'); } catch (err) { console.error(err); }
}

    require([document.querySelector('script[data-bootload]').getAttribute('data-bootload')]);
});
