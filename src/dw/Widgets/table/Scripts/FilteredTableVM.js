var DWTS;
(function (DWTS) {
    var FilteredTableViewModel = (function (_super) {
        __extends(FilteredTableViewModel, _super);
        function FilteredTableViewModel(items, options) {
            _super.call(this, items, $.extend({ filterProperty: 'name' }, options));
            this.filterText = ko.observable('');
            this.filterExternalFn = ko.observable(null);
            this._isInFiltering = this.addBusyTrigger(ko.observable(false));
            var startFilteringComputed = this.addDisposable(this.addDisposable(ko.computed(function () {
                var items = this.items(), fn = this.filterExternalFn(), txt = this.filterText();
            }, this)).extend({ deferred: true, notify: 'always' }));
            this.addDisposable(startFilteringComputed.subscribe(function () {
                this._isInFiltering(true);
                // timeout in order to simulate async process - needed for the spinner
                if (this._filteringTimeOutId)
                    clearTimeout(this._filteringTimeOutId);
                this._filteringTimeOutId = setTimeout(function () {
                    this.rows(this.getFilteredRows());
                    // remove the selection if the selected row is not visible after filtering
                    if (this.rows.indexOf(this.activeRow()) === -1) {
                        this.activeRow(null);
                    }
                    this._isInFiltering(false);
                }.bind(this), 0);
            }, this));
        }
        FilteredTableViewModel.prototype.clearFilter = function () {
            this.filterText("");
        };
        FilteredTableViewModel.prototype.applyAdditionalWork = function (items) {
            return this.getFilteredItems(items);
        };
        FilteredTableViewModel.prototype.getFilteredRows = function () {
            return this.getFilteredItems(this.items());
        };
        FilteredTableViewModel.prototype.isRowSelected = function (row) {
            return this.selectedItems.indexOf(row) > -1;
        };
        FilteredTableViewModel.prototype.getFilteredItems = function (items) {
            var filter = this.filterText(), filterProperty = this.options.filterProperty, filterBy = (filterProperty || null) && ($.isFunction(filterProperty) ? filterProperty : function (item) {
                return ko.unwrap(item[filterProperty]);
            }), filterFn = this.filterExternalFn();
            //clean the text so that it can be used as pure string in the RegEx
            var query = filter.replace(/[\\.\+\*\?\^\$\[\]\(\)\{\}\/'\#\:\!\=\|]/ig, '\\$&');
            var regex = query.split(' ').filter(function (q) {
                return q;
            }).map(function (q) {
                return new RegExp(q, 'i');
            });
            if (filterBy && regex.length) {
                items = items.filter(function (item) {
                    var match = true;
                    regex.forEach(function (r) {
                        match = match && r.test(filterBy(item));
                    });
                    return match;
                });
            }
            if (filterFn) {
                items = items.filter(filterFn);
            }
            return items;
        };
        FilteredTableViewModel.prototype.dispose = function () {
            if (this._filteringTimeOutId)
                clearTimeout(this._filteringTimeOutId);
            _super.prototype.dispose.call(this);
        };
        return FilteredTableViewModel;
    })(DWTS.SortableTableViewModel);
    DWTS.FilteredTableViewModel = FilteredTableViewModel;
})(DWTS || (DWTS = {}));
//# sourceMappingURL=filteredtablevm.js.map