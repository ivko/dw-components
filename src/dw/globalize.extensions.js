(function( factory ) {
    if ( typeof define === "function" && define.amd ) {
        define( [ "globalize" ], factory );
    } else {
        factory( Globalize );
    }
}(function (Globalize) {
    
    Globalize.applyFormattingCulture = function (culture, calendar) {
        //culture = (culture || "").toLowerCase();
        //if (!culture.startsWith("en-gb") && !culture.startsWith("de-ch")) {
        //    culture = culture.substring(0, 2);
        //}

        Globalize.culture(culture);

        if (calendar) {
            Globalize.culture().calendar = Globalize.culture().calendars[calendar];
        }
    };

    Globalize.addCultureInfo("en", "en", {
        calendars: {
            standard: {
                patterns: { X: "MM/dd/yyyy h:mm tt" }
            }
        }
    });

    Globalize.addCultureInfo("ar", "ar", {
        calendars: {
            standard: {
                patterns: { X: "dd/MM/yy hh:mm tt" }
            },
            Hijri: {
                patterns: { X: "dd/MM/yy hh:mm tt" }
            },
            Gregorian_MiddleEastFrench: {
                patterns: { X: "MM/dd/yyyy hh:mm tt" }
            },
            Gregorian_Arabic: {
                patterns: { X: "MM/dd/yyyy hh:mm tt" }
            },
            Gregorian_Localized: {
                patterns: { X: "dd/MM/yyyy hh:mm tt" }
            },
            Gregorian_TransliteratedFrench: {
                patterns: { X: "MM/dd/yyyy hh:mm tt" }
            }
        }
    });

    Globalize.addCultureInfo("bg", "bg", {
        calendars: {
            standard: {
                patterns: { X: "dd.MM.yyyy HH:mm" }
            }
        }
    });

    Globalize.addCultureInfo("de-CH", "de-CH", {
        calendars: {
            standard: {
                patterns: { X: "dd.MM.yyyy HH:mm" }
            }
        }
    });

    Globalize.addCultureInfo("de", "de", {
        calendars: {
            standard: {
                patterns: { X: "dd.MM.yyyy HH:mm" }
            }
        }
    });

    Globalize.addCultureInfo("el", "el", {
        calendars: {
            standard: {
                patterns: { X: "dd/MM/yyyy h:mm tt" }
            }
        }
    });

    Globalize.addCultureInfo("en-GB", "en-GB", {
        calendars: {
            standard: {
                patterns: { X: "dd/MM/yyyy HH:mm" }
            }
        }
    });

    Globalize.addCultureInfo("en-US", "en-US", {
        calendars: {
            standard: {
                patterns: { X: "MM/dd/yyyy h:mm tt" }
            }
        }
    });

    Globalize.addCultureInfo("es", "es", {
        calendars: {
            standard: {
                patterns: { X: "dd/MM/yyyy H:mm" }
            }
        }
    });

    Globalize.addCultureInfo("fr", "fr", {
        calendars: {
            standard: {
                patterns: { X: "dd/MM/yyyy HH:mm" }
            }
        }
    });

    Globalize.addCultureInfo("hr", "hr", {
        calendars: {
            standard: {
                patterns: { X: "dd.MM.yyyy. H:mm" }
            }
        }
    });

    Globalize.addCultureInfo("it", "it", {
        calendars: {
            standard: {
                patterns: { X: "dd/MM/yyyy HH:mm" }
            }
        }
    });

    Globalize.addCultureInfo("ja", "ja", {
        calendars: {
            standard: {
                patterns: { X: "yyyy/MM/dd H:mm" }
            },
            Japanese: {
                patterns: { X: "gg y/M/d H:mm" } //gg?
            }
        }
    });

    Globalize.addCultureInfo("nl", "nl", {
        calendars: {
            standard: {
                patterns: { X: "dd-MM-yyyy H:mm" }
            }
        }
    });

    Globalize.addCultureInfo("pl", "pl", {
        calendars: {
            standard: {
                patterns: { X: "yyyy-MM-dd HH:mm" }
            }
        }
    });

    Globalize.addCultureInfo("pt", "pt", {
        calendars: {
            standard: {
                patterns: { X: "dd/MM/yyyy HH:mm" }
            }
        }
    });

    Globalize.addCultureInfo("ru", "ru", {
        calendars: {
            standard: {
                patterns: { X: "dd.MM.yyyy H:mm" }
            }
        }
    });

    Globalize.addCultureInfo("sv", "sv", {
        calendars: {
            standard: {
                patterns: { X: "yyyy-MM-dd HH:mm" }
            }
        }
    });

    Globalize.addCultureInfo("zh", "zh", {
        calendars: {
            standard: {
                patterns: { X: "yyyy/MM/dd H:mm" }
            }
        }
    });

}));