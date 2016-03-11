define([], function() {
    return [
        {
            "id": "index",
            "moduleId": "app/modules/index",
            "label": "Introduction"
        },
        {
            "id": "core",
            "label": "Docuware Core",
            "moduleId": false,
            "children": [
                { "id": "core.disposable", "moduleId": "app/modules/core/core-disposable", "label": "Disposable" },
                { "id": "core.command", "moduleId": "app/modules/core/core-command", "label": "Command" },
                { "id": "core.test", "moduleId": "app/modules/core/core-test", "label": "Test" }
            ]
        },
        {
            "id": "ui",
            "label": "Docuware UI",
            "moduleId": false,
            "children": [
                { "id": "ui.button", "moduleId": "app/modules/ui/ui-button", "label": "Button" },
                { "id": "ui.checkbox", "moduleId": "app/modules/ui/ui-checkbox", "label": "Checkboxes" },
                { "id": "ui.radio", "moduleId": "app/modules/ui/ui-radio", "label": "Radio buttons" },
                { "id": "ui.tabs", "moduleId": "app/modules/ui/ui-tabs", "label": "Tabs" },
                { "id": "ui.table", "moduleId": "app/modules/ui/ui-table", "label": "Table" },
                { "id": "ui.combo", "moduleId": "app/modules/ui/ui-combo", "label": "Comboboxes" },
                { "id": "ui.tooltip", "moduleId": "app/modules/ui/ui-tooltip", "label": "Tooltip" },
                { "id": "ui.infobox", "moduleId": "app/modules/ui/ui-infobox", "label": "Info popover" },
                { "id": "ui.toast", "moduleId": "app/modules/ui/ui-toast", "label": "Toast" },
                { "id": "ui.menu", "moduleId": "app/modules/ui/ui-menus", "label": "Menus" }
            ]
        },
        {
            "id": "app",
            "label": "Application Components",
            "moduleId": false,
            "children": [
                { "id": "app.assignement", "moduleId": "app/modules/app/app-assignement", "label": "User assignement" },
            ]
        },
        {
            "id": "404", 
            "moduleId": "app/modules/404",
            "label": "Error404",
            "hidden": true
        }
    ];
})