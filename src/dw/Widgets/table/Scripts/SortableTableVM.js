var DWTS;
(function (DWTS) {
    var SortableTableViewModel = (function (_super) {
        __extends(SortableTableViewModel, _super);
        function SortableTableViewModel(items, options) {
            _super.call(this, items, options);
            this.sortProperty = ko.observable('');
            this.sortDirection = ko.observable(0); // -1 desc, 0 none, 1 asc
            this._forceSort = ko.observable({ dfds: [] });
            this._isInSorting = this.addBusyTrigger(ko.observable(false));
            var startSortingComputed = this.addDisposable(this.addDisposable(ko.computed(function () {
                var items = this.items(), //touch the observable as it was former times... discuss with GN
                forceSort = this._forceSort(), // touch the observable to trigget the custom sort after edit
                sortProperty = this.sortProperty(), sortDirection = this.sortDirection();
            }, this)).extend({ deferred: true, notify: 'always' }));
            this.addDisposable(startSortingComputed.subscribe(function () {
                this._isInSorting(true);
                // timeout in order to simulate async process - needed for the spinner
                if (this._sortingTimeOutId)
                    clearTimeout(this._sortingTimeOutId);
                this._sortingTimeOutId = setTimeout(function () {
                    this.rows(this.applyAdditionalWork(this.getSortedRows()));
                    this._forceSort().dfds.forEach(function (dfd) {
                        dfd.resolve();
                    });
                    this._forceSort().dfds = [];
                    this._isInSorting(false);
                }.bind(this), 0);
            }, this));
        }
        SortableTableViewModel.prototype.update = function () {
            var dfd = $.Deferred();
            this._forceSort().dfds.push(dfd);
            this._forceSort($.extend({}, this._forceSort()));
            return dfd.promise();
        };
        SortableTableViewModel.prototype.applyAdditionalWork = function (items) {
            return items;
        };
        SortableTableViewModel.prototype.getSortedRows = function () {
            return this.getSortedItems(this.items());
        };
        SortableTableViewModel.prototype.getSortedItems = function (items) {
            var sortBy = this.sortProperty(), sortDir = this.sortDirection();
            if (sortBy.length && sortDir) {
                if (this.options.sort)
                    this.options.sort(items, sortDir, sortBy);
                else
                    items.alphanumSort(sortDir, sortBy, true);
            }
            return items;
        };
        SortableTableViewModel.prototype.sortBy = function (property) {
            if (this.sortProperty() === property) {
                this.sortDirection(this.sortDirection() * -1); // invert
            }
            else {
                this.sortProperty(property);
                this.sortDirection(1); //asc
            }
        };
        SortableTableViewModel.prototype.getSortCommand = function (property) {
            return (function () {
                this.sortBy(property);
            }).bind(this);
        };
        SortableTableViewModel.prototype.getSortCss = function (property) {
            return this.addDisposable(ko.computed(function () {
                return (this.sortProperty() === property && this.sortDirection()) ?
                    (this.sortDirection() > 0 ? 'asc ui-icon-triangle-1-n' : 'desc ui-icon-triangle-1-s') : 'dw-icon-sort';
            }, this));
        };
        SortableTableViewModel.prototype.dispose = function () {
            if (this._sortingTimeOutId)
                clearTimeout(this._sortingTimeOutId);
            _super.prototype.dispose.call(this);
        };
        return SortableTableViewModel;
    })(DWTS.TableViewModel);
    DWTS.SortableTableViewModel = SortableTableViewModel;
})(DWTS || (DWTS = {}));
//# sourceMappingURL=sortabletablevm.js.map