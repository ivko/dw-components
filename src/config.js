require.config({
    waitSeconds: 15,
    paths: {
        "app": "../app",
        "globalize.extensions": "../../bower_components/dw-shared/Components/Globalize/dw.globalize.extensions",
        "prettify": "../../bower_components/google-code-prettify/src/prettify",
        "DateTime":"../../bower_components/dw-shared/Components/Widgets/DateTime"
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
        "knockout": ["jquery"],
        "app/viewModels/Disposable": ["app/global"]
    },
    urlArgs: "bust=" + (new Date()).getTime()
});