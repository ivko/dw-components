require.config({
    waitSeconds: 15,
    paths: {
        "app": "../app",
        "dw": "../dw"
    },
    shim: {
        "mootools-interfaces": ["mootools-core"],
        "knockout": ["jquery"],
        "bootstrap": ["jquery"],
        "jquery.plugin": ["jquery"],
        "jquery.dateentry": ["jquery.plugin"],
        "jquery.datetimeentry": ["jquery.plugin"],
        "jquery.timeentry": ["jquery.plugin"],
        "globalize": {
            "exports": "Globalize"
        },
        "dw/Widgets/select/js/select2": ['jquery-ui'],
    },
    urlArgs: "bust=" + (new Date()).getTime()
});