define([], function() {
    return [
        {
            "id": "core",
            "label": "dw.core",
            "moduleId": "app/modules/core",
            "pages": [
                { "id": "core.disposable", "moduleId": "app/modules/core.disposable", "label": "DW.Disposable" },
                { "id": "core.command", "moduleId": "app/modules/core.command", "label": "DW.Command" }
            ]
        }
    ];
})