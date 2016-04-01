require.config({
    waitSeconds: 15,
    paths: {
        "app": "../app",
        "DateTime":"dw/Widgets/DateTime"
    },
    map: {

    },
    shim: {
        "jquery.plugin": ["jquery"],
        "jquery.dateentry": ["jquery.plugin"],
        "jquery.datetimeentry": ["jquery.plugin"],
        "jquery.timeentry": ["jquery.plugin"],
        "globalize": {
            "exports": "Globalize"
        },
        "mootools-interfaces": ["mootools-core"],
        "knockout": ["jquery"]
    },
    urlArgs: "bust=" + (new Date()).getTime()
});