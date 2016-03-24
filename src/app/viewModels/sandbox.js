var BaseSandbox = new Class({
    template: {
        "datepickerOptions": '',
        "sandbox-js": '',
        "sandbox-html": ''
    },
    data: {
        cultures: [],
        value: null,
        pickerType: null,
        isReadOnly: null,
    },
    initialize: function () {
        this.initData();
        this.initComputed();
    },
    initData: function () {
        // Implement in child classess
    },
    initComputed: function () {
        // Implement in child classess
    },
    createViewModel: function (jsCode) {
        var VM = null;
        try {
            eval(jsCode);
            VM = new myVM;
        } catch (err) {
            console.log('buildCode error:', err.message);
        }
        return VM;
    },
    buildCode: function () {
        clearTimeout(this.timeoutId);
        this.timeoutId = this._buildCode.delay(100, this);
    },
    _buildCode: function () {

        var js = this.template['sandbox-js'];
        var jsCode = $(js).text();
        var html = this.template['sandbox-html'];
        var container = document.getElementById('sandbox-container');

        $(container).html(html).find('[attr-data-bind]').each(function (index, element) {
            var bindingValue = js_beautify('{' + $.attr(element, 'attr-data-bind') + '}', { 'preserve_newlines': false }).replace(/(^[{]|[}]$)/g, '').trim();
            $(element).attr('data-bind', bindingValue);
            $(element).removeAttr('attr-data-bind');
        });

        var htmlCode = html_beautify($(container).html(), { 'preserve_newlines': false }).replace(/</g, '&lt;').replace(/>/g, '&gt;');
        var VM = this.createViewModel(jsCode);
        if (!VM) return;

        // append to the dom
        $('#sandbox-js').html(PR.prettyPrintOne(js_beautify(jsCode, { 'preserve_newlines': false }), 'js'));
        $('#sandbox-html').html(PR.prettyPrintOne(htmlCode, 'html'));

        // process newly generated code
        ko.cleanNode(container);
        ko.applyBindings(VM, container);

        //  - remove default values??
    },
    templateSrc: function (id, element) {
        this.template[id] = $.templates(element).render(this);
        this.buildCode();
    },
    reset: function () {
        console.log('reset', this);
    }
});
