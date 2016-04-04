
/*
 * File input binding for knockout.js
 * Jesse Kipp - Nov 14, 2013
 *
 * A special binding for file input elements. Think of it like 'value', but
 * storing the encoded data from a FileReader object.
 *
 * Usage 1:
 * <input type='file' data-bind='file: fileInput'>
 * If fileInput is an observable, it will be assigned the value of the base64
 * encoded file data.
 *
 * Usage 2:
 * <input type='file' data-bind='file: {data: fileInput, name: fileName}'>
 * When passing an object, use the following keys
 *   data: the observable to store the file data (required)
 *   name: the observable to store the file name
 *   allowed: permitted content types (text/javascript, etc), as a string or
 *     array of strings. All other types will be ignored.
 *   prohibited: content types that will always be ignored.
 *   reader: an existing FileReader object. If not defined, creates a new
 *     one internally.
 */
(function ($, ko) {
    ko.bindingHandlers['file'] = {
        init: function (element, valueAccessor, allBindings) {
            var fileContents, fileName, /*allowed, prohibited, */reader, fileType, readDone, ready, clearTrigger, clearSubscription;

            if ((typeof valueAccessor()) === "function") {
                fileContents = valueAccessor();
            } else {
                fileContents = valueAccessor()['data'];
                fileName = valueAccessor()['name'];
                fileType = valueAccessor()['type'];
                ready = valueAccessor()['ready'];
                clearTrigger = valueAccessor()['clearTrigger'];
                clearSubscription = ko.computed(function () {
                    if (clearTrigger()) {
                        fileName('');
                        //fileType('');
                        //fileContents('');
                        element.value = '';
                    }
                    
                });//.extend('notify: always');

                //allowed = valueAccessor()['allowed'];
                //if ((typeof allowed) === 'string') {
                //    allowed = [allowed];
                //}

                //prohibited = valueAccessor()['prohibited'];
                //if ((typeof prohibited) === 'string') {
                //    prohibited = [prohibited];
                //}

                reader = (valueAccessor()['reader']);
            }

            reader || (reader = new FileReader());
            reader.onloadend = function () {
                fileContents(reader.result);
                readDone.resolve();
                $(element).innerHTML = $(element).innerHTML;
            }

            var handler = function () {
                if (readDone) {
                    readDone = null;
                }

                readDone = $.Deferred();
                if (ready && typeof ready === 'function') {
                    ready(readDone.promise());
                }
                //this.ready = valueAccessor()['ready'] = readDone.promise();

                if (!element.value) {
                    readDone.reject();
                    return;
                }

                var file = element.files[0];

                // Opening the file picker then canceling will trigger a 'change'
                // event without actually picking a file.
                if (file === undefined || file == null) {
                    readDone.reject();
                    //fileContents(null)
                    return;
                }

                //if (allowed) {
                //    if (!allowed.some(function (type) { return type === file.type; })) {
                //        //console.log("File " + file.name + " is not an allowed type, ignoring.")
                //        fileContents(null);
                //        return;
                //    }
                //}

                //if (prohibited) {
                //    if (prohibited.some(function (type) { return type === file.type; })) {
                //        //console.log("File " + file.name + " is a prohibited type, ignoring.")
                //        fileContents(null);
                //        return;
                //    }
                //}

                if (typeof fileType === 'function') {
                    fileType(file.name.substr(file.name.lastIndexOf('.')));
                    //fileType(file.type); 
                }

                if (typeof fileName === "function") {
                    fileName(file.name)
                }
                //$(element).val(null);
        
                reader.readAsText(file); // A callback (above) will set fileContents
            }


            //ko.utils.registerEventHandler(element, 'change', handler);
            $(element).on('change', handler);
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).off('change');
                clearSubscription.dispose();
            });
        }
    }
})(jQuery, ko);