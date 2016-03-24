require.config({
    waitSeconds: 15,
    paths: {
        "app": "../app"
    },
    map: {

    },
    shim: {
        "knockout": ["jquery"],
        "app/viewModels/Disposable": ["app/global"]
    },
    urlArgs: "bust=" + (new Date()).getTime()
});