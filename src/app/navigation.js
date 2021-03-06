define([], function() {
    return [
        {
            "id": "index",
            "moduleId": "app/modules/index",
            "label": "Introduction"
        },
        {
            "id": "core",
            "hidden": true,
            "label": "Docuware Core",
            "moduleId": false,
            "children": [
                { "id": "core.disposable", "moduleId": "app/modules/core/core-disposable", "label": "Disposable" },
                { "id": "core.command", "moduleId": "app/modules/core/core-command", "label": "Command" }
            ]
        },
        {
            "id": "ui",
            "label": "Docuware UI",
            "moduleId": false,
            "children": [
                { "id": "ui.button", "moduleId": "app/modules/ui/ui-button", "label": "Buttons" },
                { "id": "ui.checkbox", "moduleId": "app/modules/ui/ui-checkbox", "label": "Checkboxes" },
                { "id": "ui.radio", "moduleId": "app/modules/ui/ui-radio", "label": "Radio buttons" },
                { "id": "ui.tabs", "moduleId": "app/modules/ui/ui-tabs", "label": "Tabs" },
                { "disabled": true, "id": "ui.table", "moduleId": "app/modules/ui/ui-table", "label": "Table" },
                { "disabled": true, "id": "ui.combo", "moduleId": "app/modules/ui/ui-combo", "label": "Comboboxes" },
                { "disabled": true, "id": "ui.tooltip", "moduleId": "app/modules/ui/ui-tooltip", "label": "Tooltip" },
                { "id": "ui.datetime", "moduleId": "app/modules/ui/ui-datetime", "label": "Date Time" },
                { "disabled": true, "id": "ui.infobox", "moduleId": "app/modules/ui/ui-infobox", "label": "Info popover" },
                { "disabled": true, "id": "ui.toast", "moduleId": "app/modules/ui/ui-toast", "label": "Toast" },
                { "disabled": true, "id": "ui.menu", "moduleId": "app/modules/ui/ui-menus", "label": "Menus" }
            ]
        },
        {
            "id": "app",
            "hidden": true,
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