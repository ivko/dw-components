(function( factory ) {
    if ( typeof define === "function" && define.amd ) { // AMD.
        define(["jquery", "knockout", "../../../ViewModels/Disposable", "../../../global", "./AutocompleteListVM"], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {
    /*
    The logic of the autocomplete control layout should be here
    It should encapsulate the objects that will be databind to the HTML
    This will be responsible to execute the logic after marking checkboxes
    It contains all the current elements of the control (instead of living them into the bindings behavior)
    */
    var AutocompleteVM = new Class({
        Extends: DW.Disposable,
        Implements: [Events],
        index: -1,
        fieldId: null,
        visible: null,
        fieldValue: null,
        lists: {},
        options: {
            fieldValue: null, // observable
            setSelectListValue: $.noop,
            lists: []
        },

        initialize: function (options) {
            this.parent();
            $.extend(this.options, options);
            this.fieldId = DW.Utils.uniqueId();
            this.visible = this.addDisposable(ko.observable(false));
            this.fieldValue = this.options.fieldValue;
            this.initEvents();
            this.initLists();
        },

        initLists: function () {
            this.options.lists.forEach(function (options) {
                var name = options.name,
                    listVM = options.viewModel;
                if (instanceOf(listVM, DW.Autocomplete.AutocompleteListVM) === false) {
                    listVM = new DW.Autocomplete.AutocompleteListVM(listVM);
                }
                listVM.addEvent('onSelectItem', this.selectListItem.bind(this));
                this.lists[name] = listVM;
            }, this);
        },

        forceFiltering: function () {
            //force filtering is not showing the menu but just refresh it. Only changing of visibility shows the menu!
            if (this.visible() == false) {
                return;
            }
            this.filterData(this.fieldValue());
        },

        init: function () {
            this.removeSelection();
            this.forceFiltering();
        },

        filterData: function (value) {
            this.removeSelection();
            var getCallbacks = [],
                doneCallbacks = [],
                args = [].slice.apply(arguments);

            Array.forEach(this.options.lists, function (options) {
                var name = options.name;
                getCallbacks.push(options.dataProvider.getData.apply(options.dataProvider, args));
                doneCallbacks.push(this.lists[name].items);
            }, this);

            //Synchronizing the all groups of data with a deferred promise
            $.when.apply($, getCallbacks).then(function () {
                var args = Array.prototype.slice.call(arguments);
                for (var i = 0; i < args.length; i++) {
                    this.doneCallbacks[i].apply(null, [args[i]]);
                }
                if (this.context._allowDataReady()) {
                    this.context.fireEvent('dataReady');
                } else {
                    this.context.visible(false);
                }
            }.bind({
                context: this,
                doneCallbacks: doneCallbacks
            }));
        },

        getListLength: function () {
            var length = 0;
            Object.forEach(this.lists, function (list) {
                length += list.items().length;
            });
            return length;
        },
        removeSelection: function () {
            this.index = -1;
            Object.forEach(this.lists, function (list) {
                list.selectedIndex(-1);
            });
        },

        movePrevious: function () {
            if (this.index > 0) {
                this.index--;
                this.refreshIndexes();
            }
        },

        moveNext: function () {
            //this may be +2 if we want to deselect all (nothing is selected as a result of more keyups)
            if (this.index + 1 < this.getListLength()) {
                this.index++;
                this.refreshIndexes();
            }
        },

        refreshIndexes: function () {
            var index = this.index;
            Array.forEach(this.options.lists, function (options) {
                var name = options.name,
                    list = this.lists[name],
                    count = list.items().length;

                if (index < count) {
                    list.selectedIndex(index);
                } else {
                    list.selectedIndex(-1);
                }
                index = Math.max(-1, index - count);
            }, this);
        },

        selectListItem: function (text, data) {
            this._select(text, data);
            this.fireEvent('onSelectItem', arguments);
        },

        isHeighlightActive: function () {
            if (this.index >= 0) {
                return true;
            }
            return false;
        },

        selectCurrentlyHeighlightedItem: function () {
            if (this.index < 0) {
                return;
            }
            Object.forEach(this.lists, function (list) {
                if (list.selectedIndex() > -1) {
                    list.selectItem(list.items()[list.selectedIndex()]);
                }
            });
        },

        getValueFromString: function (val) {
            return val;
        },

        initEvents: function () { },

        _allowDataReady: function () {
            return true;
        },

        _select: function (value, data) {
            this.visible(false);
        }

    });

    $.extend(true, ns('DW.Autocomplete'), {
        AutocompleteVM: AutocompleteVM,
        BindingHandler: {},
        DataProvider: {}
    });

}));
