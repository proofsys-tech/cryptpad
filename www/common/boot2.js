// This is stage 1, it can be changed but you must bump the version of the project.
define([
    '/common/requireconfig.js'
], function (RequireConfig) {
    require.config(RequireConfig());

    // most of CryptPad breaks if you don't support isArray
    if (!Array.isArray) {
        Array.isArray = function(arg) { // CRYPTPAD_SHIM
            return Object.prototype.toString.call(arg) === '[object Array]';
        };
    }

    // file encryption/decryption won't work if you don't have Array.fill
    if (typeof(Array.prototype.fill) !== 'function') {
        Array.prototype.fill = function (x) { // CRYPTPAD_SHIM
            var i = 0;
            var l = this.length;
            for (;i < l; i++) { this[i] = x; }
            return this;
        };
    }

    // RPC breaks if you don't support Number.MAX_SAFE_INTEGER
    if (Number && !Number.MAX_SAFE_INTEGER) {
        Number.MAX_SAFE_INTEGER = 9007199254740991;
    }

    var failStore = function () {
        console.error(new Error('wut'));
        require(['jquery'], function ($) {
            $.ajax({
                type: 'HEAD',
                url: '/common/feedback.html?NO_LOCALSTORAGE=' + (+new Date()),
            });
        });
        window.alert("CryptPad needs localStorage to work. Try changing your cookie permissions, or using a different browser");
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
    height: 100vh;
    width: 100vw;
    z-index: 100000000;
}
#cp-logger pre {
    border: 1px solid green;
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
            if ([
                'error',
                'warn',
                'debug'
            ].indexOf(k) !== -1) {
                return function () {
                    var args = Array.prototype.slice.call(arguments);
                    c.error.apply(null, args);

                    var e = args[0];
                    //if (!e) { return; }

                    var pre = document.createElement('pre');
                    pre.innerText = JSON.stringify({
                        //origin: window.location.href,
                        message: e.message,
                        stack: e.stack,
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

    window.onerror = function (e) {
        if (/requirejs\.org/.test(e)) {
            console.log();
            console.error("Require.js threw a Script Error. This probably means you're missing a dependency for CryptPad.\nIt is recommended that the admin of this server runs `bower install && bower update` to get the latest code, then modify their cache version.\nBest of luck,\nThe CryptPad Developers");
            return void console.log();
        }
        if (window.CryptPad_loadingError) {
            //window.console.error(e);
            //logToDom.call(e);
            window.CryptPad_loadingError(e);
        }
        throw e;
    };

    try {
        var test_key = 'localStorage_test';
        var testval = Math.random().toString();
        localStorage.setItem(test_key, testval);
        if (localStorage.getItem(test_key) !== testval) {
            failStore();
        }
    } catch (e) { console.error(e); failStore(); }

    require([document.querySelector('script[data-bootload]').getAttribute('data-bootload')]);
});
