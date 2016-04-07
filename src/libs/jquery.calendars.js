/* http://keith-wood.name/calendars.html
   Calendars for jQuery v1.2.1.
   Written by Keith Wood (kbwood{at}iinet.com.au) August 2009.
   Available under the MIT (https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt) license. 
   Please attribute the author if you use it. */

(function($) { // Hide scope, no $ conflict

/* Calendars - generic date access and manipulation. */
function Calendars() {
	this.regional = [];
	this.regional[''] = {
		invalidCalendar: 'Calendar {0} not found',
		invalidDate: 'Invalid {0} date',
		invalidMonth: 'Invalid {0} month',
		invalidYear: 'Invalid {0} year',
		differentCalendars: 'Cannot mix {0} and {1} dates'
	};
	this.local = this.regional[''];
	this.calendars = {};
	this._localCals = {};
}

$.extend(Calendars.prototype, {

	/* Obtain a calendar implementation and localisation.
	   @param  name      (string) the name of the calendar,
	                     e.g. 'gregorian' (default), 'persian', 'islamic' (optional)
	   @param  language  (string) the language code to use for localisation
	                     (optional, default English = 'en')
	   @return  the calendar and localisation
	   @throws  error if calendar not found */
	instance: function(name, language) {
		name = (name || 'gregorian').toLowerCase();
		language = language || '';
		var cal = this._localCals[name + '-' + language];
		if (!cal && this.calendars[name]) {
			cal = new this.calendars[name](language);
			this._localCals[name + '-' + language] = cal;
		}
		if (!cal) {
			throw (this.local.invalidCalendar || this.regional[''].invalidCalendar).
				replace(/\{0\}/, name);
		}
		return cal;
	},

	/* Create a new date - for today if no other parameters given.
	   @param  year      (CDate) the date to copy or
	                     (number) the year for the date
	   @param  month     (number, optional) the month for the date
	   @param  day       (number, optional) the day for the date
	   @param  calendar  (*Calendar) the underlying calendar
	                     or (string) the name of the calendar (optional, default Gregorian)
	   @param  language  (string) the language to use for localisation (optional, default English)
	   @return  (CDate) the new date
	   @throws  error if an invalid date */
	newDate: function(year, month, day, calendar, language) {
		calendar = (year != null && year.year ? year.calendar() : (typeof calendar == 'string' ?
			this.instance(calendar, language) : calendar)) || this.instance();
		return calendar.newDate(year, month, day);
	}
});

/* Generic date, based on a particular calendar.
   @param  calendar  (*Calendar) the underlying calendar implementation
   @param  year      (number) the year for this date
   @param  month     (number) the month for this date
   @param  day       (number) the day for this date
   @return  (CDate) the date object
   @throws  error if an invalid date */
function CDate(calendar, year, month, day) {
	this._calendar = calendar;
	this._year = year;
	this._month = month;
	this._day = day;
	if (this._calendar._validateLevel == 0 &&
			!this._calendar.isValid(this._year, this._month, this._day)) {
		throw ($.calendars.local.invalidDate || $.calendars.regional[''].invalidDate).
			replace(/\{0\}/, this._calendar.local.name);
	}
}

/* Pad a numeric value with leading zeroes.
   @param  value   (number) the number to format
   @param  length  (number) the minimum length
   @return  (string) the formatted number */
function pad(value, length) {
	value = '' + value;
	return '000000'.substring(0, length - value.length) + value;
}

$.extend(CDate.prototype, {

	/* Create a new date.
	   @param  year   (CDate) the date to copy or
	                  (number) the year for the date (optional, default this date)
	   @param  month  (number) the month for the date (optional)
	   @param  day    (number) the day for the date (optional)
	   @return  (CDate) the new date
	   @throws  error if an invalid date */
	newDate: function(year, month, day) {
		return this._calendar.newDate((year == null ? this : year), month, day);
	},

	/* Set or retrieve the year for this date.
	   @param  year  (number) the year for the date (optional)
	   @return  (number) the date's year (if no parameter) or
	            (CDate) the updated date
	   @throws  error if an invalid date */
	year: function(year) {
		return (arguments.length == 0 ? this._year : this.set(year, 'y'));
	},

	/* Set or retrieve the month for this date.
	   @param  month  (number) the month for the date (optional)
	   @return  (number) the date's month (if no parameter) or
	            (CDate) the updated date
	   @throws  error if an invalid date */
	month: function(month) {
		return (arguments.length == 0 ? this._month : this.set(month, 'm'));
	},

	/* Set or retrieve the day for this date.
	   @param  day  (number) the day for the date (optional)
	   @return  (number) the date's day (if no parameter) or
	            (CDate) the updated date
	   @throws  error if an invalid date */
	day: function(day) {
		return (arguments.length == 0 ? this._day : this.set(day, 'd'));
	},

	/* Set new values for this date.
	   @param  year   (number) the year for the date
	   @param  month  (number) the month for the date
	   @param  day    (number) the day for the date
	   @return  (CDate) the updated date
	   @throws  error if an invalid date */
	date: function(year, month, day) {
		if (!this._calendar.isValid(year, month, day)) {
			throw ($.calendars.local.invalidDate || $.calendars.regional[''].invalidDate).
				replace(/\{0\}/, this._calendar.local.name);
		}
		this._year = year;
		this._month = month;
		this._day = day;
		return this;
	},

	/* Determine whether this date is in a leap year.
	   @return  (boolean) true if this is a leap year, false if not */
	leapYear: function() {
		return this._calendar.leapYear(this);
	},

	/* Retrieve the epoch designator for this date, e.g. BCE or CE.
	   @return  (string) the current epoch */
	epoch: function() {
		return this._calendar.epoch(this);
	},

	/* Format the year, if not a simple sequential number.
	   @return  (string) the formatted year */
	formatYear: function() {
		return this._calendar.formatYear(this);
	},

	/* Retrieve the month of the year for this date,
	   i.e. the month's position within a numbered year.
	   @return  (number) the month of the year: minMonth to months per year */
	monthOfYear: function() {
		return this._calendar.monthOfYear(this);
	},

	/* Retrieve the week of the year for this date.
	   @return  (number) the week of the year: 1 to weeks per year */
	weekOfYear: function() {
		return this._calendar.weekOfYear(this);
	},

	/* Retrieve the number of days in the year for this date.
	   @return  (number) the number of days in this year */
	daysInYear: function() {
		return this._calendar.daysInYear(this);
	},

	/* Retrieve the day of the year for this date.
	   @return  (number) the day of the year: 1 to days per year */
	dayOfYear: function() {
		return this._calendar.dayOfYear(this);
	},

	/* Retrieve the number of days in the month for this date.
	   @return  (number) the number of days */
	daysInMonth: function() {
		return this._calendar.daysInMonth(this);
	},

	/* Retrieve the day of the week for this date.
	   @return  (number) the day of the week: 0 to number of days - 1 */
	dayOfWeek: function() {
		return this._calendar.dayOfWeek(this);
	},

	/* Determine whether this date is a week day.
	   @return  (boolean) true if a week day, false if not */
	weekDay: function() {
		return this._calendar.weekDay(this);
	},

	/* Retrieve additional information about this date.
	   @return  (object) additional information - contents depends on calendar */
	extraInfo: function() {
		return this._calendar.extraInfo(this);
	},

	/* Add period(s) to a date.
	   @param  offset  (number) the number of periods to adjust by
	   @param  period  (string) one of 'y' for year, 'm' for month, 'w' for week, 'd' for day
	   @return  (CDate) the updated date */
	add: function(offset, period) {
		return this._calendar.add(this, offset, period);
	},

	/* Set a portion of the date.
	   @param  value   (number) the new value for the period
	   @param  period  (string) one of 'y' for year, 'm' for month, 'd' for day
	   @return  (CDate) the updated date
	   @throws  error if not a valid date */
	set: function(value, period) {
		return this._calendar.set(this, value, period);
	},

	/* Compare this date to another date.
	   @param  date  (CDate) the other date
	   @return  (number) -1 if this date is before the other date,
	            0 if they are equal, or +1 if this date is after the other date */
	compareTo: function(date) {
		if (this._calendar.name != date._calendar.name) {
			throw ($.calendars.local.differentCalendars || $.calendars.regional[''].differentCalendars).
				replace(/\{0\}/, this._calendar.local.name).replace(/\{1\}/, date._calendar.local.name);
		}
		var c = (this._year != date._year ? this._year - date._year :
			this._month != date._month ? this.monthOfYear() - date.monthOfYear() :
			this._day - date._day);
		return (c == 0 ? 0 : (c < 0 ? -1 : +1));
	},

	/* Retrieve the calendar backing this date.
	   @return  (*Calendar) the calendar implementation */
	calendar: function() {
		return this._calendar;
	},

	/* Retrieve the Julian date equivalent for this date,
	   i.e. days since January 1, 4713 BCE Greenwich noon.
	   @return  (number) the equivalent Julian date */
	toJD: function() {
		return this._calendar.toJD(this);
	},

	/* Create a new date from a Julian date.
	   @param  jd  (number) the Julian date to convert
	   @return  (CDate) the equivalent date */
	fromJD: function(jd) {
		return this._calendar.fromJD(jd);
	},

	/* Convert this date to a standard (Gregorian) JavaScript Date.
	   @return  (Date) the equivalent JavaScript date */
	toJSDate: function() {
		return this._calendar.toJSDate(this);
	},

	/* Create a new date from a standard (Gregorian) JavaScript Date.
	   @param  jsd  (Date) the JavaScript date to convert
	   @return  (CDate) the equivalent date */
	fromJSDate: function(jsd) {
		return this._calendar.fromJSDate(jsd);
	},

	/* Convert to a string for display.
	   @return  (string) this date as a string */
	toString: function() {
		return (this.year() < 0 ? '-' : '') + pad(Math.abs(this.year()), 4) +
			'-' + pad(this.month(), 2) + '-' + pad(this.day(), 2);
	}
});

/* Basic functionality for all calendars.
   Other calendars should extend this:
   OtherCalendar.prototype = new BaseCalendar; */
function BaseCalendar() {
	this.shortYearCutoff = '+10';
}

$.extend(BaseCalendar.prototype, {
	_validateLevel: 0, // "Stack" to turn validation on/off

	/* Create a new date within this calendar - today if no parameters given.
	   @param  year   (CDate) the date to duplicate or
	                  (number) the year for the date
	   @param  month  (number) the month for the date
	   @param  day    (number) the day for the date
	   @return  (CDate) the new date
	   @throws  error if not a valid date or a different calendar used */
	newDate: function(year, month, day) {
		if (year == null) {
			return this.today();
		}
		if (year.year) {
			this._validate(year, month, day,
				$.calendars.local.invalidDate || $.calendars.regional[''].invalidDate);
			day = year.day();
			month = year.month();
			year = year.year();
		}
		return new CDate(this, year, month, day);
	},

	/* Create a new date for today.
	   @return  (CDate) today's date */
	today: function() {
		return this.fromJSDate(new Date());
	},

	/* Retrieve the epoch designator for this date.
	   @param  year  (CDate) the date to examine or
	                 (number) the year to examine
	   @return  (string) the current epoch
	   @throws  error if an invalid year or a different calendar used */
	epoch: function(year) {
		var date = this._validate(year, this.minMonth, this.minDay,
			$.calendars.local.invalidYear || $.calendars.regional[''].invalidYear);
		return (date.year() < 0 ? this.local.epochs[0] : this.local.epochs[1]);
	},

	/* Format the year, if not a simple sequential number
	   @param  year  (CDate) the date to format or
	                 (number) the year to format
	   @return  (string) the formatted year
	   @throws  error if an invalid year or a different calendar used */
	formatYear: function(year) {
		var date = this._validate(year, this.minMonth, this.minDay,
			$.calendars.local.invalidYear || $.calendars.regional[''].invalidYear);
		return (date.year() < 0 ? '-' : '') + pad(Math.abs(date.year()), 4)
	},

	/* Retrieve the number of months in a year.
	   @param  year  (CDate) the date to examine or
	                 (number) the year to examine
	   @return  (number) the number of months
	   @throws  error if an invalid year or a different calendar used */
	monthsInYear: function(year) {
		this._validate(year, this.minMonth, this.minDay,
			$.calendars.local.invalidYear || $.calendars.regional[''].invalidYear);
		return 12;
	},

	/* Calculate the month's ordinal position within the year -
	   for those calendars that don't start at month 1!
	   @param  year   (CDate) the date to examine or
	                  (number) the year to examine
	   @param  month  (number) the month to examine
	   @return  (number) the ordinal position, starting from minMonth
	   @throws  error if an invalid year/month or a different calendar used */
	monthOfYear: function(year, month) {
		var date = this._validate(year, month, this.minDay,
			$.calendars.local.invalidMonth || $.calendars.regional[''].invalidMonth);
		return (date.month() + this.monthsInYear(date) - this.firstMonth) %
			this.monthsInYear(date) + this.minMonth;
	},

	/* Calculate actual month from ordinal position, starting from minMonth.
	   @param  year  (number) the year to examine
	   @param  ord   (number) the month's ordinal position
	   @return  (number) the month's number
	   @throws  error if an invalid year/month */
	fromMonthOfYear: function(year, ord) {
		var m = (ord + this.firstMonth - 2 * this.minMonth) %
			this.monthsInYear(year) + this.minMonth;
		this._validate(year, m, this.minDay,
			$.calendars.local.invalidMonth || $.calendars.regional[''].invalidMonth);
		return m;
	},

	/* Retrieve the number of days in a year.
	   @param  year   (CDate) the date to examine or
	                  (number) the year to examine
	   @return  (number) the number of days
	   @throws  error if an invalid year or a different calendar used */
	daysInYear: function(year) {
		var date = this._validate(year, this.minMonth, this.minDay,
			$.calendars.local.invalidYear || $.calendars.regional[''].invalidYear);
		return (this.leapYear(date) ? 366 : 365);
	},

	/* Retrieve the day of the year for a date.
	   @param  year   (CDate) the date to convert or
	                  (number) the year to convert
	   @param  month  (number) the month to convert
	   @param  day    (number) the day to convert
	   @return  (number) the day of the year
	   @throws  error if an invalid date or a different calendar used */
	dayOfYear: function(year, month, day) {
		var date = this._validate(year, month, day,
			$.calendars.local.invalidDate || $.calendars.regional[''].invalidDate);
		return date.toJD() - this.newDate(date.year(),
			this.fromMonthOfYear(date.year(), this.minMonth), this.minDay).toJD() + 1;
	},

	/* Retrieve the number of days in a week.
	   @return  (number) the number of days */
	daysInWeek: function() {
		return 7;
	},

	/* Retrieve the day of the week for a date.
	   @param  year   (CDate) the date to examine or
	                  (number) the year to examine
	   @param  month  (number) the month to examine
	   @param  day    (number) the day to examine
	   @return  (number) the day of the week: 0 to number of days - 1
	   @throws  error if an invalid date or a different calendar used */
	dayOfWeek: function(year, month, day) {
		var date = this._validate(year, month, day,
			$.calendars.local.invalidDate || $.calendars.regional[''].invalidDate);
		return (Math.floor(this.toJD(date)) + 2) % this.daysInWeek();
	},

	/* Retrieve additional information about a date.
	   @param  year   (CDate) the date to examine or
	                  (number) the year to examine
	   @param  month  (number) the month to examine
	   @param  day    (number) the day to examine
	   @return  (object) additional information - contents depends on calendar
	   @throws  error if an invalid date or a different calendar used */
	extraInfo: function(year, month, day) {
		this._validate(year, month, day,
			$.calendars.local.invalidDate || $.calendars.regional[''].invalidDate);
		return {};
	},

	/* Add period(s) to a date.
	   Cater for no year zero.
	   @param  date    (CDate) the starting date
	   @param  offset  (number) the number of periods to adjust by
	   @param  period  (string) one of 'y' for year, 'm' for month, 'w' for week, 'd' for day
	   @return  (CDate) the updated date
	   @throws  error if a different calendar used */
	add: function(date, offset, period) {
		this._validate(date, this.minMonth, this.minDay,
			$.calendars.local.invalidDate || $.calendars.regional[''].invalidDate);
		return this._correctAdd(date, this._add(date, offset, period), offset, period);
	},

	/* Add period(s) to a date.
	   @param  date    (CDate) the starting date
	   @param  offset  (number) the number of periods to adjust by
	   @param  period  (string) one of 'y' for year, 'm' for month, 'w' for week, 'd' for day
	   @return  (CDate) the updated date */
	_add: function(date, offset, period) {
		this._validateLevel++;
		if (period == 'd' || period == 'w') {
			var jd = date.toJD() + offset * (period == 'w' ? this.daysInWeek() : 1);
			var d = date.calendar().fromJD(jd);
			this._validateLevel--;
			return [d.year(), d.month(), d.day()];
		}
		try {
			var y = date.year() + (period == 'y' ? offset : 0);
			var m = date.monthOfYear() + (period == 'm' ? offset : 0);
			var d = date.day();// + (period == 'd' ? offset : 0) +
				//(period == 'w' ? offset * this.daysInWeek() : 0);
			var resyncYearMonth = function(calendar) {
				while (m < calendar.minMonth) {
					y--;
					m += calendar.monthsInYear(y);
				}
				var yearMonths = calendar.monthsInYear(y);
				while (m > yearMonths - 1 + calendar.minMonth) {
					y++;
					m -= yearMonths;
					yearMonths = calendar.monthsInYear(y);
				}
			};
			if (period == 'y') {
				if (date.month() != this.fromMonthOfYear(y, m)) { // Hebrew
					m = this.newDate(y, date.month(), this.minDay).monthOfYear();
				}
				m = Math.min(m, this.monthsInYear(y));
				d = Math.min(d, this.daysInMonth(y, this.fromMonthOfYear(y, m)));
			}
			else if (period == 'm') {
				resyncYearMonth(this);
				d = Math.min(d, this.daysInMonth(y, this.fromMonthOfYear(y, m)));
			}
			var ymd = [y, this.fromMonthOfYear(y, m), d];
			this._validateLevel--;
			return ymd;
		}
		catch (e) {
			this._validateLevel--;
			throw e;
		}
	},

	/* Correct a candidate date after adding period(s) to a date.
	   Handle no year zero if necessary.
	   @param  date    (CDate) the starting date
	   @param  ymd     (number[3]) the added date
	   @param  offset  (number) the number of periods to adjust by
	   @param  period  (string) one of 'y' for year, 'm' for month, 'w' for week, 'd' for day
	   @return  (CDate) the updated date */
	_correctAdd: function(date, ymd, offset, period) {
		if (!this.hasYearZero && (period == 'y' || period == 'm')) {
			if (ymd[0] == 0 || // In year zero
					(date.year() > 0) != (ymd[0] > 0)) { // Crossed year zero
				var adj = {y: [1, 1, 'y'], m: [1, this.monthsInYear(-1), 'm'],
					w: [this.daysInWeek(), this.daysInYear(-1), 'd'],
					d: [1, this.daysInYear(-1), 'd']}[period];
				var dir = (offset < 0 ? -1 : +1);
				ymd = this._add(date, offset * adj[0] + dir * adj[1], adj[2]);
			}
		}
		return date.date(ymd[0], ymd[1], ymd[2]);
	},

	/* Set a portion of the date.
	   @param  date    (CDate) the starting date
	   @param  value   (number) the new value for the period
	   @param  period  (string) one of 'y' for year, 'm' for month, 'd' for day
	   @return  (CDate) the updated date
	   @throws  error if an invalid date or a different calendar used */
	set: function(date, value, period) {
		this._validate(date, this.minMonth, this.minDay,
			$.calendars.local.invalidDate || $.calendars.regional[''].invalidDate);
		var y = (period == 'y' ? value : date.year());
		var m = (period == 'm' ? value : date.month());
		var d = (period == 'd' ? value : date.day());
		if (period == 'y' || period == 'm') {
			d = Math.min(d, this.daysInMonth(y, m));
		}
		return date.date(y, m, d);
	},

	/* Determine whether a date is valid for this calendar.
	   @param  year   (number) the year to examine
	   @param  month  (number) the month to examine
	   @param  day    (number) the day to examine
	   @return  (boolean) true if a valid date, false if not */
	isValid: function(year, month, day) {
		this._validateLevel++;
		var valid = (this.hasYearZero || year != 0);
		if (valid) {
			var date = this.newDate(year, month, this.minDay);
			valid = (month >= this.minMonth && month - this.minMonth < this.monthsInYear(date)) &&
				(day >= this.minDay && day - this.minDay < this.daysInMonth(date));
		}
		this._validateLevel--;
		return valid;
	},

	/* Convert the date to a standard (Gregorian) JavaScript Date.
	   @param  year   (CDate) the date to convert or
	                  (number) the year to convert
	   @param  month  (number) the month to convert
	   @param  day    (number) the day to convert
	   @return  (Date) the equivalent JavaScript date
	   @throws  error if an invalid date or a different calendar used */
	toJSDate: function(year, month, day) {
		var date = this._validate(year, month, day,
			$.calendars.local.invalidDate || $.calendars.regional[''].invalidDate);
		return $.calendars.instance().fromJD(this.toJD(date)).toJSDate();
	},

	/* Convert the date from a standard (Gregorian) JavaScript Date.
	   @param  jsd  (Date) the JavaScript date
	   @return  (CDate) the equivalent DateUtils date */
	fromJSDate: function(jsd) {
		return this.fromJD($.calendars.instance().fromJSDate(jsd).toJD());
	},

	/* Check that a candidate date is from the same calendar and is valid.
	   @param  year   (CDate) the date to validate or
	                  (number) the year to validate
	   @param  month  (number) the month to validate
	   @param  day    (number) the day to validate
	   @param  error  (string) error message if invalid
	   @throws  error if different calendars used or invalid date */
	_validate: function(year, month, day, error) {
		if (year.year) {
			if (this._validateLevel == 0 && this.name != year.calendar().name) {
				throw ($.calendars.local.differentCalendars || $.calendars.regional[''].differentCalendars).
					replace(/\{0\}/, this.local.name).replace(/\{1\}/, year.calendar().local.name);
			}
			return year;
		}
		try {
			this._validateLevel++;
			if (this._validateLevel == 1 && !this.isValid(year, month, day)) {
				throw error.replace(/\{0\}/, this.local.name);
			}
			var date = this.newDate(year, month, day);
			this._validateLevel--;
			return date;
		}
		catch (e) {
			this._validateLevel--;
			throw e;
		}
	}
});

/* Implementation of the Proleptic Gregorian Calendar.
   See http://en.wikipedia.org/wiki/Gregorian_calendar
   and http://en.wikipedia.org/wiki/Proleptic_Gregorian_calendar.
   @param  language  (string) the language code (default English) for localisation (optional) */
function GregorianCalendar(language) {
	this.local = this.regional[language] || this.regional[''];
}

GregorianCalendar.prototype = new BaseCalendar;

$.extend(GregorianCalendar.prototype, {
	name: 'Gregorian', // The calendar name
	jdEpoch: 1721425.5, // Julian date of start of Gregorian epoch: 1 January 0001 CE
	daysPerMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], // Days per month in a common year
	hasYearZero: false, // True if has a year zero, false if not
	minMonth: 1, // The minimum month number
	firstMonth: 1, // The first month in the year
	minDay: 1, // The minimum day number

	regional: { // Localisations
		'': {
			name: 'Gregorian', // The calendar name
			epochs: ['BCE', 'CE'],
			monthNames: ['January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December'],
			monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
			dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
			dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
			dateFormat: 'mm/dd/yyyy', // See format options on parseDate
			firstDay: 0, // The first day of the week, Sun = 0, Mon = 1, ...
			isRTL: false // True if right-to-left language, false if left-to-right
		}
	},
	
	/* Determine whether this date is in a leap year.
	   @param  year  (CDate) the date to examine or
	                 (number) the year to examine
	   @return  (boolean) true if this is a leap year, false if not
	   @throws  error if an invalid year or a different calendar used */
	leapYear: function(year) {
		var date = this._validate(year, this.minMonth, this.minDay,
			$.calendars.local.invalidYear || $.calendars.regional[''].invalidYear);
		var year = date.year() + (date.year() < 0 ? 1 : 0); // No year zero
		return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
	},

	/* Determine the week of the year for a date - ISO 8601.
	   @param  year   (CDate) the date to examine or
	                  (number) the year to examine
	   @param  month  (number) the month to examine
	   @param  day    (number) the day to examine
	   @return  (number) the week of the year
	   @throws  error if an invalid date or a different calendar used */
	weekOfYear: function(year, month, day) {
		// Find Thursday of this week starting on Monday
		var checkDate = this.newDate(year, month, day);
		checkDate.add(4 - (checkDate.dayOfWeek() || 7), 'd');
		return Math.floor((checkDate.dayOfYear() - 1) / 7) + 1;
	},

	/* Retrieve the number of days in a month.
	   @param  year   (CDate) the date to examine or
	                  (number) the year of the month
	   @param  month  (number) the month
	   @return  (number) the number of days in this month
	   @throws  error if an invalid month/year or a different calendar used */
	daysInMonth: function(year, month) {
		var date = this._validate(year, month, this.minDay,
			$.calendars.local.invalidMonth || $.calendars.regional[''].invalidMonth);
		return this.daysPerMonth[date.month() - 1] +
			(date.month() == 2 && this.leapYear(date.year()) ? 1 : 0);
	},

	/* Determine whether this date is a week day.
	   @param  year   (CDate) the date to examine or
	                  (number) the year to examine
	   @param  month  (number) the month to examine
	   @param  day    (number) the day to examine
	   @return  (boolean) true if a week day, false if not
	   @throws  error if an invalid date or a different calendar used */
	weekDay: function(year, month, day) {
		return (this.dayOfWeek(year, month, day) || 7) < 6;
	},

	/* Retrieve the Julian date equivalent for this date,
	   i.e. days since January 1, 4713 BCE Greenwich noon.
	   @param  year   (CDate) the date to convert or
	                  (number) the year to convert
	   @param  month  (number) the month to convert
	   @param  day    (number) the day to convert
	   @return  (number) the equivalent Julian date
	   @throws  error if an invalid date or a different calendar used */
	toJD: function(year, month, day) {
		var date = this._validate(year, month, day,
			$.calendars.local.invalidDate || $.calendars.regional[''].invalidDate);
		year = date.year();
		month = date.month();
		day = date.day();
		if (year < 0) { year++; } // No year zero
		// Jean Meeus algorithm, "Astronomical Algorithms", 1991
		if (month < 3) {
			month += 12;
			year--;
		}
		var a = Math.floor(year / 100);
		var b = 2 - a + Math.floor(a / 4);
		return Math.floor(365.25 * (year + 4716)) +
			Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
	},

	/* Create a new date from a Julian date.
	   @param  jd  (number) the Julian date to convert
	   @return  (CDate) the equivalent date */
	fromJD: function(jd) {
		// Jean Meeus algorithm, "Astronomical Algorithms", 1991
		var z = Math.floor(jd + 0.5);
		var a = Math.floor((z - 1867216.25) / 36524.25);
		a = z + 1 + a - Math.floor(a / 4);
		var b = a + 1524;
		var c = Math.floor((b - 122.1) / 365.25);
		var d = Math.floor(365.25 * c);
		var e = Math.floor((b - d) / 30.6001);
		var day = b - d - Math.floor(e * 30.6001);
		var month = e - (e > 13.5 ? 13 : 1);
		var year = c - (month > 2.5 ? 4716 : 4715);
		if (year <= 0) { year--; } // No year zero
		return this.newDate(year, month, day);
	},

	/* Convert this date to a standard (Gregorian) JavaScript Date.
	   @param  year   (CDate) the date to convert or
	                  (number) the year to convert
	   @param  month  (number) the month to convert
	   @param  day    (number) the day to convert
	   @return  (Date) the equivalent JavaScript date
	   @throws  error if an invalid date or a different calendar used */
	toJSDate: function(year, month, day) {
		var date = this._validate(year, month, day,
			$.calendars.local.invalidDate || $.calendars.regional[''].invalidDate);
		var jsd = new Date(date.year(), date.month() - 1, date.day());
		jsd.setHours(0);
		jsd.setMinutes(0);
		jsd.setSeconds(0);
		jsd.setMilliseconds(0);
		// Hours may be non-zero on daylight saving cut-over:
		// > 12 when midnight changeover, but then cannot generate
		// midnight datetime, so jump to 1AM, otherwise reset.
		jsd.setHours(jsd.getHours() > 12 ? jsd.getHours() + 2 : 0);
		return jsd;
	},

	/* Create a new date from a standard (Gregorian) JavaScript Date.
	   @param  jsd  (Date) the JavaScript date to convert
	   @return  (CDate) the equivalent date */
	fromJSDate: function(jsd) {
		return this.newDate(jsd.getFullYear(), jsd.getMonth() + 1, jsd.getDate());
	}
});

// Singleton manager
$.calendars = new Calendars();

// Date template
$.calendars.cdate = CDate;

// Base calendar template
$.calendars.baseCalendar = BaseCalendar;

// Gregorian calendar implementation
$.calendars.calendars.gregorian = GregorianCalendar;

})(jQuery);

/* http://keith-wood.name/calendars.html
   Islamic calendar for jQuery v1.2.1.
   Written by Keith Wood (kbwood{at}iinet.com.au) August 2009.
   Available under the MIT (https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt) license. 
   Please attribute the author if you use it. */

(function($) { // Hide scope, no $ conflict

/* Implementation of the Islamic or '16 civil' calendar.
   Based on code from http://www.iranchamber.com/calendar/converter/iranian_calendar_converter.php.
   See also http://en.wikipedia.org/wiki/Islamic_calendar.
   @param  language  (string) the language code (default English) for localisation (optional) */
function IslamicCalendar(language) {
	this.local = this.regional[language || ''] || this.regional[''];
}

IslamicCalendar.prototype = new $.calendars.baseCalendar;

$.extend(IslamicCalendar.prototype, {
	name: 'Islamic', // The calendar name
	jdEpoch: 1948439.5, // Julian date of start of Islamic epoch: 16 July 622 CE
	daysPerMonth: [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29], // Days per month in a common year
	hasYearZero: false, // True if has a year zero, false if not
	minMonth: 1, // The minimum month number
	firstMonth: 1, // The first month in the year
	minDay: 1, // The minimum day number

	regional: { // Localisations
		'': {
			name: 'Islamic', // The calendar name
			epochs: ['BH', 'AH'],
			monthNames: ['Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani', 'Jumada al-awwal', 'Jumada al-thani',
			'Rajab', 'Sha\'aban', 'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'],
			monthNamesShort: ['Muh', 'Saf', 'Rab1', 'Rab2', 'Jum1', 'Jum2', 'Raj', 'Sha\'', 'Ram', 'Shaw', 'DhuQ', 'DhuH'],
			dayNames: ['Yawm al-ahad', 'Yawm al-ithnayn', 'Yawm ath-thulaathaa\'',
			'Yawm al-arbi\'aa\'', 'Yawm al-khamīs', 'Yawm al-jum\'a', 'Yawm as-sabt'],
			dayNamesShort: ['Aha', 'Ith', 'Thu', 'Arb', 'Kha', 'Jum', 'Sab'],
			dayNamesMin: ['Ah','It','Th','Ar','Kh','Ju','Sa'],
			dateFormat: 'yyyy/mm/dd', // See format options on BaseCalendar.formatDate
			firstDay: 6, // The first day of the week, Sun = 0, Mon = 1, ...
			isRTL: false // True if right-to-left language, false if left-to-right
		}
	},

	/* Determine whether this date is in a leap year.
	   @param  year  (CDate) the date to examine or
	                 (number) the year to examine
	   @return  (boolean) true if this is a leap year, false if not
	   @throws  error if an invalid year or a different calendar used */
	leapYear: function(year) {
		var date = this._validate(year, this.minMonth, this.minDay, $.calendars.local.invalidYear);
		return (date.year() * 11 + 14) % 30 < 11;
	},

	/* Determine the week of the year for a date.
	   @param  year   (CDate) the date to examine or
	                  (number) the year to examine
	   @param  month  (number) the month to examine
	   @param  day    (number) the day to examine
	   @return  (number) the week of the year
	   @throws  error if an invalid date or a different calendar used */
	weekOfYear: function(year, month, day) {
		// Find Sunday of this week starting on Sunday
		var checkDate = this.newDate(year, month, day);
		checkDate.add(-checkDate.dayOfWeek(), 'd');
		return Math.floor((checkDate.dayOfYear() - 1) / 7) + 1;
	},

	/* Retrieve the number of days in a year.
	   @param  year   (CDate) the date to examine or
	                  (number) the year to examine
	   @return  (number) the number of days
	   @throws  error if an invalid year or a different calendar used */
	daysInYear: function(year) {
		return (this.leapYear(year) ? 355 : 354);
	},

	/* Retrieve the number of days in a month.
	   @param  year   (CDate) the date to examine or
	                  (number) the year of the month
	   @param  month  (number) the month
	   @return  (number) the number of days in this month
	   @throws  error if an invalid month/year or a different calendar used */
	daysInMonth: function(year, month) {
		var date = this._validate(year, month, this.minDay, $.calendars.local.invalidMonth);
		return this.daysPerMonth[date.month() - 1] +
			(date.month() == 12 && this.leapYear(date.year()) ? 1 : 0);
	},

	/* Determine whether this date is a week day.
	   @param  year   (CDate) the date to examine or
	                  (number) the year to examine
	   @param  month  (number) the month to examine
	   @param  day    (number) the day to examine
	   @return  (boolean) true if a week day, false if not
	   @throws  error if an invalid date or a different calendar used */
	weekDay: function(year, month, day) {
		return this.dayOfWeek(year, month, day) != 5;
	},

	/* Retrieve the Julian date equivalent for this date,
	   i.e. days since January 1, 4713 BCE Greenwich noon.
	   @param  year   (CDate) the date to convert or
	                  (number) the year to convert
	   @param  month  (number) the month to convert
	   @param  day    (number) the day to convert
	   @return  (number) the equivalent Julian date
	   @throws  error if an invalid date or a different calendar used */
	toJD: function(year, month, day) {
		var date = this._validate(year, month, day, $.calendars.local.invalidDate);
		year = date.year();
		month = date.month();
		day = date.day();
		year = (year <= 0 ? year + 1 : year);
		return day + Math.ceil(29.5 * (month - 1)) + (year - 1) * 354 +
			Math.floor((3 + (11 * year)) / 30) + this.jdEpoch - 1;
	},

	/* Create a new date from a Julian date.
	   @param  jd  (number) the Julian date to convert
	   @return  (CDate) the equivalent date */
	fromJD: function(jd) {
		jd = Math.floor(jd) + 0.5;
		var year = Math.floor((30 * (jd - this.jdEpoch) + 10646) / 10631);
		year = (year <= 0 ? year - 1 : year);
		var month = Math.min(12, Math.ceil((jd - 29 - this.toJD(year, 1, 1)) / 29.5) + 1);
		var day = jd - this.toJD(year, month, 1) + 1;
		return this.newDate(year, month, day);
	}
});

// Islamic (16 civil) calendar implementation
$.calendars.calendars.islamic = IslamicCalendar;

})(jQuery);
/* http://keith-wood.name/calendars.html
   Calendars date picker for jQuery v1.2.1.
   Written by Keith Wood (kbwood{at}iinet.com.au) August 2009.
   Available under the MIT (https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt) license. 
   Please attribute the author if you use it. */

(function($) { // Hide scope, no $ conflict

/* Calendar picker manager. */
function CalendarsPicker() {
	this._defaults = {
		calendar: $.calendars.instance(), // The calendar to use
		pickerClass: '', // CSS class to add to this instance of the datepicker
		showOnFocus: true, // True for popup on focus, false for not
		showTrigger: null, // Element to be cloned for a trigger, null for none
		showAnim: 'show', // Name of jQuery animation for popup, '' for no animation
		showOptions: {}, // Options for enhanced animations
		showSpeed: 'normal', // Duration of display/closure
		popupContainer: null, // The element to which a popup calendar is added, null for body
		alignment: 'bottom', // Alignment of popup - with nominated corner of input:
			// 'top' or 'bottom' aligns depending on language direction,
			// 'topLeft', 'topRight', 'bottomLeft', 'bottomRight'
		fixedWeeks: false, // True to always show 6 weeks, false to only show as many as are needed
		firstDay: null, // First day of the week, 0 = Sunday, 1 = Monday, ...
			// defaults to calendar local setting if null
		calculateWeek: null, // Calculate week of the year from a date, null for calendar default
		monthsToShow: 1, // How many months to show, cols or [rows, cols]
		monthsOffset: 0, // How many months to offset the primary month by
		monthsToStep: 1, // How many months to move when prev/next clicked
		monthsToJump: 12, // How many months to move when large prev/next clicked
		useMouseWheel: true, // True to use mousewheel if available, false to never use it
		changeMonth: true, // True to change month/year via drop-down, false for navigation only
		yearRange: 'c-10:c+10', // Range of years to show in drop-down: 'any' for direct text entry
			// or 'start:end', where start/end are '+-nn' for relative to today
			// or 'c+-nn' for relative to the currently selected date
			// or 'nnnn' for an absolute year
		showOtherMonths: false, // True to show dates from other months, false to not show them
		selectOtherMonths: false, // True to allow selection of dates from other months too
		defaultDate: null, // Date to show if no other selected
		selectDefaultDate: false, // True to pre-select the default date if no other is chosen
		minDate: null, // The minimum selectable date
		maxDate: null, // The maximum selectable date
		dateFormat: null, // Format for dates, defaults to calendar setting if null
		autoSize: false, // True to size the input field according to the date format
		rangeSelect: false, // Allows for selecting a date range on one date picker
		rangeSeparator: ' - ', // Text between two dates in a range
		multiSelect: 0, // Maximum number of selectable dates, zero for single select
		multiSeparator: ',', // Text between multiple dates
		onDate: null, // Callback as a date is added to the datepicker
		onShow: null, // Callback just before a datepicker is shown
		onChangeMonthYear: null, // Callback when a new month/year is selected
		onSelect: null, // Callback when a date is selected
		onToday: null, //// Callback when today is selected
		onClose: null, // Callback when a datepicker is closed
		altField: null, // Alternate field to update in synch with the datepicker
		altFormat: null, // Date format for alternate field, defaults to dateFormat
		constrainInput: true, // True to constrain typed input to dateFormat allowed characters
		commandsAsDateFormat: false, // True to apply formatDate to the command texts
		commands: this.commands // Command actions that may be added to a layout by name
	};
	this.regional = [];
	this.regional[''] = { // Default regional settings
		renderer: this.defaultRenderer, // The rendering templates
		prevText: '&lt;Prev', // Text for the previous month command
		prevStatus: 'Show the previous month', // Status text for the previous month command
		prevJumpText: '&lt;&lt;', // Text for the previous year command
		prevJumpStatus: 'Show the previous year', // Status text for the previous year command
		nextText: 'Next&gt;', // Text for the next month command
		nextStatus: 'Show the next month', // Status text for the next month command
		nextJumpText: '&gt;&gt;', // Text for the next year command
		nextJumpStatus: 'Show the next year', // Status text for the next year command
		currentText: 'Current', // Text for the current month command
		currentStatus: 'Show the current month', // Status text for the current month command
		todayText: 'Today', // Text for the today's month command
		todayStatus: 'Show today\'s month', // Status text for the today's month command
		clearText: 'Clear', // Text for the clear command
		clearStatus: 'Clear all the dates', // Status text for the clear command
		closeText: 'Close', // Text for the close command
		closeStatus: 'Close the datepicker', // Status text for the close command
		yearStatus: 'Change the year', // Status text for year selection
		monthStatus: 'Change the month', // Status text for month selection
		weekText: 'Wk', // Text for week of the year column header
		weekStatus: 'Week of the year', // Status text for week of the year column header
		dayStatus: 'Select DD, M d, yyyy', // Status text for selectable days
		defaultStatus: 'Select a date', // Status text shown by default
		isRTL: false // True if language is right-to-left
	};
	$.extend(this._defaults, this.regional['']);
	this._disabled = [];
}

$.extend(CalendarsPicker.prototype, {
	/* Class name added to elements to indicate already configured with calendar picker. */
	markerClassName: 'hasCalendarsPicker',
	/* Name of the data property for instance settings. */
	propertyName: 'calendarsPicker',

	_popupClass: 'calendars-popup', // Marker for popup division
	_triggerClass: 'calendars-trigger', // Marker for trigger element
	_disableClass: 'calendars-disable', // Marker for disabled element
	_monthYearClass: 'calendars-month-year', // Marker for month/year inputs
	_curMonthClass: 'calendars-month-', // Marker for current month/year
	_anyYearClass: 'calendars-any-year', // Marker for year direct input
	_curDoWClass: 'calendars-dow-', // Marker for day of week
	
	commands: { // Command actions that may be added to a layout by name
		// name: { // The command name, use '{button:name}' or '{link:name}' in layouts
		//		text: '', // The field in the regional settings for the displayed text
		//		status: '', // The field in the regional settings for the status text
		//      // The keystroke to trigger the action
		//		keystroke: {keyCode: nn, ctrlKey: boolean, altKey: boolean, shiftKey: boolean},
		//		enabled: fn, // The function that indicates the command is enabled
		//		date: fn, // The function to get the date associated with this action
		//		action: fn} // The function that implements the action
		prev: {text: 'prevText', status: 'prevStatus', // Previous month
			keystroke: {keyCode: 33}, // Page up
			enabled: function(inst) {
				var minDate = inst.curMinDate();
				return (!minDate || inst.drawDate.newDate().
					add(1 - inst.options.monthsToStep - inst.options.monthsOffset, 'm').
					day(inst.options.calendar.minDay).add(-1, 'd').compareTo(minDate) != -1); },
			date: function(inst) {
				return inst.drawDate.newDate().
					add(-inst.options.monthsToStep - inst.options.monthsOffset, 'm').
					day(inst.options.calendar.minDay); },
			action: function(inst) {
				plugin._changeMonthPlugin(this, -inst.options.monthsToStep); }
		},
		prevJump: {text: 'prevJumpText', status: 'prevJumpStatus', // Previous year
			keystroke: {keyCode: 33, ctrlKey: true}, // Ctrl + Page up
			enabled: function(inst) {
				var minDate = inst.curMinDate();
				return (!minDate || inst.drawDate.newDate().
					add(1 - inst.options.monthsToJump - inst.options.monthsOffset, 'm').
					day(inst.options.calendar.minDay).add(-1, 'd').compareTo(minDate) != -1); },
			date: function(inst) {
				return inst.drawDate.newDate().
					add(-inst.options.monthsToJump - inst.options.monthsOffset, 'm').
					day(inst.options.calendar.minDay); },
			action: function(inst) {
				plugin._changeMonthPlugin(this, -inst.options.monthsToJump); }
		},
		next: {text: 'nextText', status: 'nextStatus', // Next month
			keystroke: {keyCode: 34}, // Page down
			enabled: function(inst) {
				var maxDate = inst.get('maxDate');
				return (!maxDate || inst.drawDate.newDate().
					add(inst.options.monthsToStep - inst.options.monthsOffset, 'm').
					day(inst.options.calendar.minDay).compareTo(maxDate) != +1); },
			date: function(inst) {
				return inst.drawDate.newDate().
					add(inst.options.monthsToStep - inst.options.monthsOffset, 'm').
					day(inst.options.calendar.minDay); },
			action: function(inst) {
				plugin._changeMonthPlugin(this, inst.options.monthsToStep); }
		},
		nextJump: {text: 'nextJumpText', status: 'nextJumpStatus', // Next year
			keystroke: {keyCode: 34, ctrlKey: true}, // Ctrl + Page down
			enabled: function(inst) {
				var maxDate = inst.get('maxDate');
				return (!maxDate || inst.drawDate.newDate().
					add(inst.options.monthsToJump - inst.options.monthsOffset, 'm').
					day(inst.options.calendar.minDay).compareTo(maxDate) != +1);	},
			date: function(inst) {
				return inst.drawDate.newDate().
					add(inst.options.monthsToJump - inst.options.monthsOffset, 'm').
					day(inst.options.calendar.minDay); },
			action: function(inst) {
				plugin._changeMonthPlugin(this, inst.options.monthsToJump); }
		},
		current: {text: 'currentText', status: 'currentStatus', // Current month
			keystroke: {keyCode: 36, ctrlKey: true}, // Ctrl + Home
			enabled: function(inst) {
				var minDate = inst.curMinDate();
				var maxDate = inst.get('maxDate');
				var curDate = inst.selectedDates[0] || inst.options.calendar.today();
				return (!minDate || curDate.compareTo(minDate) != -1) &&
					(!maxDate || curDate.compareTo(maxDate) != +1); },
			date: function(inst) {
				return inst.selectedDates[0] || inst.options.calendar.today(); },
			action: function(inst) {
				var curDate = inst.selectedDates[0] || inst.options.calendar.today();
				plugin._showMonthPlugin(this, curDate.year(), curDate.month()); }
		},
		today: {text: 'todayText', status: 'todayStatus', // Today's month
			keystroke: {keyCode: 36, ctrlKey: true}, // Ctrl + Home
			enabled: function(inst) {
				var minDate = inst.curMinDate();
				var maxDate = inst.get('maxDate');
				return (!minDate || inst.options.calendar.today().compareTo(minDate) != -1) &&
					(!maxDate || inst.options.calendar.today().compareTo(maxDate) != +1); },
			date: function(inst) { return inst.options.calendar.today(); },
			action: function(inst) { plugin._showMonthPlugin(this); }
		},
		clear: {text: 'clearText', status: 'clearStatus', // Clear the datepicker
			keystroke: {keyCode: 35, ctrlKey: true}, // Ctrl + End
			enabled: function(inst) { return true; },
			date: function(inst) { return null; },
			action: function(inst) { plugin._clearPlugin(this); }
		},
		close: {text: 'closeText', status: 'closeStatus', // Close the datepicker
			keystroke: {keyCode: 27}, // Escape
			enabled: function(inst) { return true; },
			date: function(inst) { return null; },
			action: function(inst) { plugin._hidePlugin(this); }
		},
		prevWeek: {text: 'prevWeekText', status: 'prevWeekStatus', // Previous week
			keystroke: {keyCode: 38, ctrlKey: true}, // Ctrl + Up
			enabled: function(inst) {
				var minDate = inst.curMinDate();
				return (!minDate || inst.drawDate.newDate().
					add(-inst.options.calendar.daysInWeek(), 'd').compareTo(minDate) != -1); },
			date: function(inst) { return inst.drawDate.newDate().
				add(-inst.options.calendar.daysInWeek(), 'd'); },
			action: function(inst) { plugin._changeDayPlugin(
				this, -inst.options.calendar.daysInWeek()); }
		},
		prevDay: {text: 'prevDayText', status: 'prevDayStatus', // Previous day
			keystroke: {keyCode: 37, ctrlKey: true}, // Ctrl + Left
			enabled: function(inst) {
				var minDate = inst.curMinDate();
				return (!minDate || inst.drawDate.newDate().add(-1, 'd').
					compareTo(minDate) != -1); },
			date: function(inst) { return inst.drawDate.newDate().add(-1, 'd'); },
			action: function(inst) { plugin._changeDayPlugin(this, -1); }
		},
		nextDay: {text: 'nextDayText', status: 'nextDayStatus', // Next day
			keystroke: {keyCode: 39, ctrlKey: true}, // Ctrl + Right
			enabled: function(inst) {
				var maxDate = inst.get('maxDate');
				return (!maxDate || inst.drawDate.newDate().add(1, 'd').
					compareTo(maxDate) != +1); },
			date: function(inst) { return inst.drawDate.newDate().add(1, 'd'); },
			action: function(inst) { plugin._changeDayPlugin(this, 1); }
		},
		nextWeek: {text: 'nextWeekText', status: 'nextWeekStatus', // Next week
			keystroke: {keyCode: 40, ctrlKey: true}, // Ctrl + Down
			enabled: function(inst) {
				var maxDate = inst.get('maxDate');
				return (!maxDate || inst.drawDate.newDate().
					add(inst.options.calendar.daysInWeek(), 'd').compareTo(maxDate) != +1); },
			date: function(inst) { return inst.drawDate.newDate().
				add(inst.options.calendar.daysInWeek(), 'd'); },
			action: function(inst) { plugin._changeDayPlugin(
				this, inst.options.calendar.daysInWeek()); }
		}
	},

	/* Default template for generating a calendar picker. */
	defaultRenderer: {
		// Anywhere: '{l10n:name}' to insert localised value for name,
		// '{link:name}' to insert a link trigger for command name,
		// '{button:name}' to insert a button trigger for command name,
		// '{popup:start}...{popup:end}' to mark a section for inclusion in a popup datepicker only,
		// '{inline:start}...{inline:end}' to mark a section for inclusion in an inline datepicker only
		// Overall structure: '{months}' to insert calendar months
		picker: '<div class="calendars">' +
		'<div class="calendars-nav">{link:prev}{link:today}{link:next}</div>{months}' +
		'{popup:start}<div class="calendars-ctrl">{link:clear}{link:close}</div>{popup:end}' +
		'<div class="calendars-clear-fix"></div></div>',
		// One row of months: '{months}' to insert calendar months
		monthRow: '<div class="calendars-month-row">{months}</div>',
		// A single month: '{monthHeader:dateFormat}' to insert the month header -
		// dateFormat is optional and defaults to 'MM yyyy',
		// '{weekHeader}' to insert a week header, '{weeks}' to insert the month's weeks
		month: '<div class="calendars-month"><div class="calendars-month-header">{monthHeader}</div>' +
		'<table><thead>{weekHeader}</thead><tbody>{weeks}</tbody></table></div>',
		// A week header: '{days}' to insert individual day names
		weekHeader: '<tr>{days}</tr>',
		// Individual day header: '{day}' to insert day name
		dayHeader: '<th>{day}</th>',
		// One week of the month: '{days}' to insert the week's days, '{weekOfYear}' to insert week of year
		week: '<tr>{days}</tr>',
		// An individual day: '{day}' to insert day value
		day: '<td>{day}</td>',
		// jQuery selector, relative to picker, for a single month
		monthSelector: '.calendars-month',
		// jQuery selector, relative to picker, for individual days
		daySelector: 'td',
		// Class for right-to-left (RTL) languages
		rtlClass: 'calendars-rtl',
		// Class for multi-month datepickers
		multiClass: 'calendars-multi',
		// Class for selectable dates
		defaultClass: '',
		// Class for currently selected dates
		selectedClass: 'calendars-selected',
		// Class for highlighted dates
		highlightedClass: 'calendars-highlight',
		// Class for today
		todayClass: 'calendars-today',
		// Class for days from other months
		otherMonthClass: 'calendars-other-month',
		// Class for days on weekends
		weekendClass: 'calendars-weekend',
		// Class prefix for commands
		commandClass: 'calendars-cmd',
		// Extra class(es) for commands that are buttons
		commandButtonClass: '',
		// Extra class(es) for commands that are links
		commandLinkClass: '',
		// Class for disabled commands
		disabledClass: 'calendars-disabled'
	},

	/* Override the default settings for all calendar picker instances.
	   @param  options  (object) the new settings to use as defaults
	   @return  (CalendarPicker) this object */
	setDefaults: function(options) {
		$.extend(this._defaults, options || {});
		return this;
	},

	/* Attach the calendar picker functionality to an input field.
	   @param  target   (element) the control to affect
	   @param  options  (object) the custom options for this instance */
	_attachPlugin: function(target, options) {
		target = $(target);
		if (target.hasClass(this.markerClassName)) {
			return;
		}
		var inlineSettings = ($.fn.metadata ? target.metadata() || {} : {});
		var inst = {options: $.extend({}, this._defaults, inlineSettings, options),
			target: target, selectedDates: [], drawDate: null, pickingRange: false,
			inline: ($.inArray(target[0].nodeName.toLowerCase(), ['div', 'span']) > -1),
			get: function(name) { // Get a setting value, computing if necessary
				if ($.inArray(name, ['defaultDate', 'minDate', 'maxDate']) > -1) { // Decode date settings
					return this.options.calendar.determineDate(this.options[name], null,
						this.selectedDates[0], this.get('dateFormat'), inst.getConfig());
				}
				if (name == 'dateFormat') {
					return this.options.dateFormat || this.options.calendar.local.dateFormat;
				}
				return this.options[name];
			},
			curMinDate: function() {
				return (this.pickingRange ? this.selectedDates[0] : this.get('minDate'));
			},
			getConfig: function() {
				return {dayNamesShort: this.options.dayNamesShort, dayNames: this.options.dayNames,
					monthNamesShort: this.options.monthNamesShort, monthNames: this.options.monthNames,
					calculateWeek: this.options.calculateWeek, shortYearCutoff: this.options.shortYearCutoff};
			}
		};
		target.addClass(this.markerClassName).data(this.propertyName, inst);
		if (inst.inline) {
			this._update(target[0]);
			if ($.fn.mousewheel) {
				target.mousewheel(this._doMouseWheel);
			}
		}
		else {
			this._attachments(target, inst);
			target.bind('keydown.' + this.propertyName, this._keyDown).
				bind('keypress.' + this.propertyName, this._keyPress).
				bind('keyup.' + this.propertyName, this._keyUp);
			if (target.attr('disabled')) {
				this._disablePlugin(target[0]);
			}
		}
	},

	/* Retrieve or reconfigure the settings for a control.
	   @param  target   (element) the control to affect
	   @param  options  (object) the new options for this instance or
	                    (string) an individual property name
	   @param  value    (any) the individual property value (omit if options
	                    is an object or to retrieve the value of a setting)
	   @return  (any) if retrieving a value */
	_optionPlugin: function(target, options, value) {
		target = $(target);
		var inst = target.data(this.propertyName);
		if (!options || (typeof options == 'string' && value == null)) { // Get option
			var name = options;
			options = (inst || {}).options;
			return (options && name ? options[name] : options);
		}

		if (!target.hasClass(this.markerClassName)) {
			return;
		}
		options = options || {};
		if (typeof options == 'string') {
			var name = options;
			options = {};
			options[name] = value;
		}
		if (options.calendar && options.calendar != inst.options.calendar) {
			var discardDate = function(name) {
				return (typeof inst.options[name] == 'object' ? null : inst.options[name]);
			};
			options = $.extend({defaultDate: discardDate('defaultDate'),
				minDate: discardDate('minDate'), maxDate: discardDate('maxDate')}, options);
			inst.selectedDates = [];
			inst.drawDate = null;
		}
		var dates = inst.selectedDates;
		$.extend(inst.options, options);
		this._setDatePlugin(target[0], dates, null, false, true);
		inst.pickingRange = false;
		var calendar = inst.options.calendar;
		var defaultDate = inst.get('defaultDate');
		inst.drawDate = this._checkMinMax((defaultDate ? defaultDate : inst.drawDate) ||
			defaultDate || calendar.today(), inst).newDate();
		if (!inst.inline) {
			this._attachments(target, inst);
		}
		if (inst.inline || inst.div) {
			this._update(target[0]);
		}
	},

	/* Attach events and trigger, if necessary.
	   @param  target  (jQuery) the control to affect
	   @param  inst    (object) the current instance settings */
	_attachments: function(target, inst) {
		target.unbind('focus.' + this.propertyName);
		if (inst.options.showOnFocus) {
			target.bind('focus.' + this.propertyName, this._showPlugin);
		}
		if (inst.trigger) {
			inst.trigger.remove();
		}
		var trigger = inst.options.showTrigger;
		inst.trigger = (!trigger ? $([]) :
			$(trigger).clone().removeAttr('id').addClass(this._triggerClass)
				[inst.options.isRTL ? 'insertBefore' : 'insertAfter'](target).
				click(function() {
					if (!plugin._isDisabledPlugin(target[0])) {
						plugin[plugin.curInst == inst ? '_hidePlugin' : '_showPlugin'](target[0]);
					}
				}));
		this._autoSize(target, inst);
		var dates = this._extractDates(inst, target.val());
		if (dates) {
			this._setDatePlugin(target[0], dates, null, true);
		}
		var defaultDate = inst.get('defaultDate');
		if (inst.options.selectDefaultDate && defaultDate && inst.selectedDates.length == 0) {
			this._setDatePlugin(target[0], (defaultDate || inst.options.calendar.today()).newDate());
		}
	},

	/* Apply the maximum length for the date format.
	   @param  inst  (object) the current instance settings */
	_autoSize: function(target, inst) {
		if (inst.options.autoSize && !inst.inline) {
			var calendar = inst.options.calendar;
			var date = calendar.newDate(2009, 10, 20); // Ensure double digits
			var dateFormat = inst.get('dateFormat');
			if (dateFormat.match(/[DM]/)) {
				var findMax = function(names) {
					var max = 0;
					var maxI = 0;
					for (var i = 0; i < names.length; i++) {
						if (names[i].length > max) {
							max = names[i].length;
							maxI = i;
						}
					}
					return maxI;
				};
				date.month(findMax(calendar.local[dateFormat.match(/MM/) ? // Longest month
					'monthNames' : 'monthNamesShort']) + 1);
				date.day(findMax(calendar.local[dateFormat.match(/DD/) ? // Longest day
					'dayNames' : 'dayNamesShort']) + 20 - date.dayOfWeek());
			}
			inst.target.attr('size', date.formatDate(dateFormat).length);
		}
	},

	/* Remove the calendar picker functionality from a control.
	   @param  target  (element) the control to affect */
	_destroyPlugin: function(target) {
		target = $(target);
		if (!target.hasClass(this.markerClassName)) {
			return;
		}
		var inst = target.data(this.propertyName);
		if (inst.trigger) {
			inst.trigger.remove();
		}
		target.removeClass(this.markerClassName).removeData(this.propertyName).
			empty().unbind('.' + this.propertyName);
		if (inst.inline && $.fn.mousewheel) {
			target.unmousewheel();
		}
		if (!inst.inline && inst.options.autoSize) {
			target.removeAttr('size');
		}
	},

	/* Apply multiple event functions.
	   Usage, for example: onShow: multipleEvents(fn1, fn2, ...)
	   @param  fns  (function...) the functions to apply */
	multipleEvents: function(fns) {
		var funcs = arguments;
		return function(args) {
			for (var i = 0; i < funcs.length; i++) {
				funcs[i].apply(this, arguments);
			}
		};
	},

    /* Gets trigger object */
	_getTrigger: function (target) {
	    target = $(target);
	    if (!target.hasClass(this.markerClassName)) {
	        return;
	    }
	    var inst = target.data(this.propertyName);
	    return inst.trigger;
	},

	/* Enable the control.
	   @param  target  (element) the control to affect */
	_enablePlugin: function(target) {
		target = $(target);
		if (!target.hasClass(this.markerClassName)) {
			return;
		}
		var inst = target.data(this.propertyName);
		if (inst.inline) {
			target.children('.' + this._disableClass).remove().end().
				find('button,select').removeAttr('disabled').end().
				find('a').attr('href', 'javascript:void(0)');
		}
		else {
			target.prop('disabled', false);
			inst.trigger.filter('button.' + this._triggerClass).
				removeAttr('disabled').end().
				filter('img.' + this._triggerClass).
				css({opacity: '1.0', cursor: ''});
		}
		this._disabled = $.map(this._disabled,
			function(value) { return (value == target[0] ? null : value); }); // Delete entry
	},

	/* Disable the control.
	   @param  target  (element) the control to affect */
	_disablePlugin: function(target) {
		target = $(target);
		if (!target.hasClass(this.markerClassName)) {
			return;
		}
		var inst = target.data(this.propertyName);
		if (inst.inline) {
			var inline = target.children(':last');
			var offset = inline.offset();
			var relOffset = {left: 0, top: 0};
			inline.parents().each(function() {
				if ($(this).css('position') == 'relative') {
					relOffset = $(this).offset();
					return false;
				}
			});
			var zIndex = target.css('zIndex');
			zIndex = (zIndex == 'auto' ? 0 : parseInt(zIndex, 10)) + 1;
			target.prepend('<div class="' + this._disableClass + '" style="' +
				'width: ' + inline.outerWidth() + 'px; height: ' + inline.outerHeight() +
				'px; left: ' + (offset.left - relOffset.left) + 'px; top: ' +
				(offset.top - relOffset.top) + 'px; z-index: ' + zIndex + '"></div>').
				find('button,select').attr('disabled', 'disabled').end().
				find('a').removeAttr('href');
		}
		else {
			target.prop('disabled', true);
			inst.trigger.filter('button.' + this._triggerClass).
				attr('disabled', 'disabled').end().
				filter('img.' + this._triggerClass).
				css({opacity: '0.5', cursor: 'default'});
		}
		this._disabled = $.map(this._disabled,
			function(value) { return (value == target[0] ? null : value); }); // Delete entry
		this._disabled.push(target[0]);
	},

	/* Is the first field in a jQuery collection disabled as a datepicker?
	   @param  target  (element) the control to examine
	   @return  (boolean) true if disabled, false if enabled */
	_isDisabledPlugin: function(target) {
		return (target && $.inArray(target, this._disabled) > -1);
	},

	/* Show a popup datepicker.
	   @param  target  (event) a focus event or
	                   (element) the control to use */
	_showPlugin: function(target) {
		target = $(target.target || target);
		var inst = target.data(plugin.propertyName);
		if (plugin.curInst == inst) {
			return;
		}
		if (plugin.curInst) {
			plugin._hidePlugin(plugin.curInst, true);
		}
		if (inst) {
			// Retrieve existing date(s)
			inst.lastVal = null;
			inst.selectedDates = plugin._extractDates(inst, target.val());
			inst.pickingRange = false;
			inst.drawDate = plugin._checkMinMax((inst.selectedDates[0] ||
				inst.get('defaultDate') || inst.options.calendar.today()).newDate(), inst);
			plugin.curInst = inst;
			// Generate content
			plugin._update(target[0], true);
			// Adjust position before showing
			var offset = plugin._checkOffset(inst);
			inst.div.css({left: offset.left, top: offset.top});
			// And display
			var showAnim = inst.options.showAnim;
			var showSpeed = inst.options.showSpeed;
			if ($.effects && $.effects[showAnim]) {
				var data = inst.div.data(); // Update old effects data
				for (var key in data) {
					if (key.match(/^ec\.storage\./)) {
						data[key] = inst._mainDiv.css(key.replace(/ec\.storage\./, ''));
					}
				}
				inst.div.data(data).show(showAnim, inst.options.showOptions, showSpeed);
			}
			else {
				inst.div[showAnim || 'show'](showAnim ? showSpeed : 0);
			}
		}
	},

	/* Extract possible dates from a string.
	   @param  inst  (object) the current instance settings
	   @param  text  (string) the text to extract from
	   @return  (CDate[]) the extracted dates */
	_extractDates: function(inst, datesText) {
		if (datesText == inst.lastVal) {
			return;
		}
		inst.lastVal = datesText;
		datesText = datesText.split(inst.options.multiSelect ? inst.options.multiSeparator :
			(inst.options.rangeSelect ? inst.options.rangeSeparator : '\x00'));
		var dates = [];
		for (var i = 0; i < datesText.length; i++) {
			try {
				var date = inst.options.calendar.parseDate(inst.get('dateFormat'), datesText[i]);
				if (date) {
					var found = false;
					for (var j = 0; j < dates.length; j++) {
						if (dates[j].compareTo(date) == 0) {
							found = true;
							break;
						}
					}
					if (!found) {
						dates.push(date);
					}
				}
			}
			catch (e) {
				// Ignore
			}
		}
		dates.splice(inst.options.multiSelect || (inst.options.rangeSelect ? 2 : 1), dates.length);
		if (inst.options.rangeSelect && dates.length == 1) {
			dates[1] = dates[0];
		}
		return dates;
	},

	/* Update the datepicker display.
	   @param  target  (event) a focus event or
	                   (element) the control to use
	   @param  hidden  (boolean) true to initially hide the datepicker */
	_update: function(target, hidden) {
		target = $(target.target || target);
		var inst = target.data(plugin.propertyName);
		if (inst) {
			if (inst.inline || plugin.curInst == inst) {
				if ($.isFunction(inst.options.onChangeMonthYear) &&
						(!inst.prevDate || inst.prevDate.year() != inst.drawDate.year() ||
						inst.prevDate.month() != inst.drawDate.month())) {
					inst.options.onChangeMonthYear.apply(target[0],
						[inst.drawDate.year(), inst.drawDate.month()]);
				}
			}
			if (inst.inline) {
				target.html(this._generateContent(target[0], inst));
			}
			else if (plugin.curInst == inst) {
				if (!inst.div) {
					inst.div = $('<div></div>').addClass(this._popupClass).
						css({display: (hidden ? 'none' : 'static'), position: 'absolute',
							left: target.offset().left,
							top: target.offset().top + target.outerHeight()}).
						appendTo($(inst.options.popupContainer || 'body'));
					if ($.fn.mousewheel) {
						inst.div.mousewheel(this._doMouseWheel);
					}
				}
				inst.div.html(this._generateContent(target[0], inst));
				target.focus();
			}
		}
	},

	/* Update the input field and any alternate field with the current dates.
	   @param  target  (element) the control to use
	   @param  keyUp   (boolean, internal) true if coming from keyUp processing */
	_updateInput: function(target, keyUp) {
		var inst = $.data(target, this.propertyName);
		if (inst) {
			var value = '';
			var altValue = '';
			var sep = (inst.options.multiSelect ? inst.options.multiSeparator :
				inst.options.rangeSeparator);
			var calendar = inst.options.calendar;
			var dateFormat = inst.get('dateFormat');
			var altFormat = inst.options.altFormat || dateFormat;
			for (var i = 0; i < inst.selectedDates.length; i++) {
				value += (keyUp ? '' : (i > 0 ? sep : '') +
					calendar.formatDate(dateFormat, inst.selectedDates[i]));
				altValue += (i > 0 ? sep : '') +
					calendar.formatDate(altFormat, inst.selectedDates[i]);
			}
			if (!inst.inline && !keyUp) {
				$(target).val(value);
			}
			$(inst.options.altField).val(altValue);
			if ($.isFunction(inst.options.onSelect) && !keyUp && !inst.inSelect) {
				inst.inSelect = true; // Prevent endless loops
				inst.options.onSelect.apply(target, [inst.selectedDates]);
				inst.inSelect = false;
			}
		}
	},

	/* Retrieve the size of left and top borders for an element.
	   @param  elem  (jQuery) the element of interest
	   @return  (number[2]) the left and top borders */
	_getBorders: function(elem) {
		var convert = function(value) {
			return {thin: 1, medium: 3, thick: 5}[value] || value;
		};
		return [parseFloat(convert(elem.css('border-left-width'))),
			parseFloat(convert(elem.css('border-top-width')))];
	},

	/* Check positioning to remain on the screen.
	   @param  inst  (object) the current instance settings
	   @return  (object) the updated offset for the datepicker */
	_checkOffset: function(inst) {
		var base = (inst.target.is(':hidden') && inst.trigger ? inst.trigger : inst.target);
		var offset = base.offset();
		var browserWidth = window.innerWidth || document.documentElement.clientWidth;
		var browserHeight = window.innerHeight || document.documentElement.clientHeight;
		if (browserWidth == 0) {
			return offset;
		}
		var isFixed = false;
		$(inst.target).parents().each(function() {
			isFixed |= $(this).css('position') == 'fixed';
			return !isFixed;
		});
		var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
		var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
		var above = offset.top - (isFixed ? scrollY : 0) - inst.div.outerHeight();
		var below = offset.top - (isFixed ? scrollY : 0) + base.outerHeight();
		var alignL = offset.left - (isFixed ? scrollX : 0);
		var alignR = offset.left - (isFixed ? scrollX : 0) + base.outerWidth() - inst.div.outerWidth();
		var tooWide = (offset.left - scrollX + inst.div.outerWidth()) > browserWidth;
		var tooHigh = (offset.top - scrollY + inst.target.outerHeight() +
			inst.div.outerHeight()) > browserHeight;
		inst.div.css('position', isFixed ? 'fixed' : 'absolute');
		var alignment = inst.options.alignment;
		if (alignment == 'topLeft') {
			offset = {left: alignL, top: above};
		}
		else if (alignment == 'topRight') {
			offset = {left: alignR, top: above};
		}
		else if (alignment == 'bottomLeft') {
			offset = {left: alignL, top: below};
		}
		else if (alignment == 'bottomRight') {
			offset = {left: alignR, top: below};
		}
		else if (alignment == 'top') {
			offset = {left: (inst.options.isRTL || tooWide ? alignR : alignL), top: above};
		}
		else { // bottom
			offset = {left: (inst.options.isRTL || tooWide ? alignR : alignL),
				top: (tooHigh ? above : below)};
		}
		offset.left = Math.max((isFixed ? 0 : scrollX), offset.left);
		offset.top = Math.max((isFixed ? 0 : scrollY), offset.top);
		return offset;
	},

	/* Close date picker if clicked elsewhere.
	   @param  event  (MouseEvent) the mouse click to check */
	_checkExternalClick: function(event) {
		if (!plugin.curInst) {
			return;
		}
		var target = $(event.target);
		if (!target.parents().andSelf().hasClass(plugin._popupClass) &&
				!target.hasClass(plugin.markerClassName) &&
				!target.parents().andSelf().hasClass(plugin._triggerClass)) {
			plugin._hidePlugin(plugin.curInst);
		}
	},

	/* Hide a popup datepicker.
	   @param  target     (element) the control to use or
	                      (object) the current instance settings
	   @param  immediate  (boolean) true to close immediately without animation */
	_hidePlugin: function(target, immediate) {
		if (!target) {
			return;
		}
		var inst = $.data(target, this.propertyName) || target;
		if (inst && inst == plugin.curInst) {
			var showAnim = (immediate ? '' : inst.options.showAnim);
			var showSpeed = inst.options.showSpeed;
			var postProcess = function() {
				if (!inst.div) {
					return;
				}
				inst.div.remove();
				inst.div = null;
				plugin.curInst = null;
				if ($.isFunction(inst.options.onClose)) {
					inst.options.onClose.apply(target, [inst.selectedDates]);
				}
			};
			inst.div.stop();
			if ($.effects && $.effects[showAnim]) {
				inst.div.hide(showAnim, inst.options.showOptions, showSpeed, postProcess);
			}
			else {
				var hideAnim = (showAnim == 'slideDown' ? 'slideUp' :
					(showAnim == 'fadeIn' ? 'fadeOut' : 'hide'));
				inst.div[hideAnim]((showAnim ? showSpeed : 0), postProcess);
			}
		}
	},

	/* Handle keystrokes in the datepicker.
	   @param  event  (KeyEvent) the keystroke
	   @return  (boolean) true if not handled, false if handled */
	_keyDown: function(event) {
		var target = event.target;
		var inst = $.data(target, plugin.propertyName);
		var handled = false;
		if (inst.div) {
			if (event.keyCode == 9) { // Tab - close
				plugin._hidePlugin(target);
			}
			else if (event.keyCode == 13) { // Enter - select
			    var element = $('a.' + inst.options.renderer.highlightedClass, inst.div);
			    if (element.length) {
			        plugin._selectDatePlugin(target, element[0]);
			    } else {
			        plugin._hidePlugin(target);
			    }
			    handled = true;
			}
			else { // Command keystrokes
			    var commands = inst.options.commands;
			    for (var name in commands) {
			        var command = commands[name];
			        if (command.keystroke.keyCode == event.keyCode &&
							!!command.keystroke.ctrlKey == !!(event.ctrlKey || event.metaKey) &&
							!!command.keystroke.altKey == event.altKey &&
							!!command.keystroke.shiftKey == event.shiftKey) {
			            plugin._performActionPlugin(target, name);
			            handled = true;
			            break;
			        }
			    }
			}
		}
		else { // Show on 'current' keystroke
			var command = inst.options.commands.current;
			if (command.keystroke.keyCode == event.keyCode &&
					!!command.keystroke.ctrlKey == !!(event.ctrlKey || event.metaKey) &&
					!!command.keystroke.altKey == event.altKey &&
					!!command.keystroke.shiftKey == event.shiftKey) {
				plugin._showPlugin(target);
				handled = true;
			}
		}
		inst.ctrlKey = ((event.keyCode < 48 && event.keyCode != 32) ||
			event.ctrlKey || event.metaKey);
		if (handled) {
			event.preventDefault();
			event.stopPropagation();
		}
		return !handled;
	},

	/* Filter keystrokes in the datepicker.
	   @param  event  (KeyEvent) the keystroke
	   @return  (boolean) true if allowed, false if not allowed */
	_keyPress: function(event) {
		var inst = $(event.target).data(plugin.propertyName);
		if (inst && inst.options.constrainInput) {
			var ch = String.fromCharCode(event.keyCode || event.charCode);
			var allowedChars = plugin._allowedChars(inst);
			return (event.metaKey || inst.ctrlKey || ch < ' ' ||
				!allowedChars || allowedChars.indexOf(ch) > -1);
		}
		return true;
	},

	/* Determine the set of characters allowed by the date format.
	   @param  inst  (object) the current instance settings
	   @return  (string) the set of allowed characters, or null if anything allowed */
	_allowedChars: function(inst) {
		var allowedChars = (inst.options.multiSelect ? inst.options.multiSeparator :
			(inst.options.rangeSelect ? inst.options.rangeSeparator : ''));
		var literal = false;
		var hasNum = false;
		var dateFormat = inst.get('dateFormat');
		for (var i = 0; i < dateFormat.length; i++) {
			var ch = dateFormat.charAt(i);
			if (literal) {
				if (ch == "'" && dateFormat.charAt(i + 1) != "'") {
					literal = false;
				}
				else {
					allowedChars += ch;
				}
			}
			else {
				switch (ch) {
					case 'd': case 'm': case 'o': case 'w':
						allowedChars += (hasNum ? '' : '0123456789'); hasNum = true; break;
					case 'y': case '@': case '!':
						allowedChars += (hasNum ? '' : '0123456789') + '-'; hasNum = true; break;
					case 'J':
						allowedChars += (hasNum ? '' : '0123456789') + '-.'; hasNum = true; break;
					case 'D': case 'M': case 'Y':
						return null; // Accept anything
					case "'":
						if (dateFormat.charAt(i + 1) == "'") {
							allowedChars += "'";
						}
						else {
							literal = true;
						}
						break;
					default:
						allowedChars += ch;
				}
			}
		}
		return allowedChars;
	},

	/* Synchronise datepicker with the field.
	   @param  event  (KeyEvent) the keystroke
	   @return  (boolean) true if allowed, false if not allowed */
	_keyUp: function(event) {
		var target = event.target;
		var inst = $.data(target, plugin.propertyName);
		if (inst && !inst.ctrlKey && inst.lastVal != inst.target.val()) {
			try {
				var dates = plugin._extractDates(inst, inst.target.val());
				if (dates.length > 0) {
					plugin._setDatePlugin(target, dates, null, true);
				}
			}
			catch (event) {
				// Ignore
			}
		}
		return true;
	},

	/* Increment/decrement month/year on mouse wheel activity.
	   @param  event  (event) the mouse wheel event
	   @param  delta  (number) the amount of change */
	_doMouseWheel: function(event, delta) {
		var target = (plugin.curInst && plugin.curInst.target[0]) ||
			$(event.target).closest('.' + plugin.markerClassName)[0];
		if (plugin._isDisabledPlugin(target)) {
			return;
		}
		var inst = $.data(target, plugin.propertyName);
		if (inst.options.useMouseWheel) {
			delta = (delta < 0 ? -1 : +1);
			plugin._changeMonthPlugin(target,
				-inst.options[event.ctrlKey ? 'monthsToJump' : 'monthsToStep'] * delta);
		}
		event.preventDefault();
	},

	/* Clear an input and close a popup datepicker.
	   @param  target  (element) the control to use */
	_clearPlugin: function(target) {
		var inst = $.data(target, this.propertyName);
		if (inst) {
			inst.selectedDates = [];
			this._hidePlugin(target);
			var defaultDate = inst.get('defaultDate');
			if (inst.options.selectDefaultDate && defaultDate) {
				this._setDatePlugin(target,
					(defaultDate || inst.options.calendar.today()).newDate());
			}
			else {
				this._updateInput(target);
			}
		}
	},

	/* Retrieve the selected date(s) for a calendar picker.
	   @param  target  (element) the control to examine
	   @return  (CDate[]) the selected date(s) */
	_getDatePlugin: function(target) {
		var inst = $.data(target, this.propertyName);
		return (inst ? inst.selectedDates : []);
	},

	/* Set the selected date(s) for a calendar picker.
	   @param  target   (element) the control to examine
	   @param  dates    (CDate or number or string or [] of these) the selected date(s)
	   @param  endDate  (CDate or number or string) the ending date for a range (optional)
	   @param  keyUp    (boolean, internal) true if coming from keyUp processing
	   @param  setOpt   (boolean, internal) true if coming from option processing */
	_setDatePlugin: function(target, dates, endDate, keyUp, setOpt) {
		var inst = $.data(target, this.propertyName);
		if (inst) {
			if (!$.isArray(dates)) {
				dates = [dates];
				if (endDate) {
					dates.push(endDate);
				}
			}
			var minDate = inst.get('minDate');
			var maxDate = inst.get('maxDate');
			var curDate = inst.selectedDates[0];
			inst.selectedDates = [];
			for (var i = 0; i < dates.length; i++) {
				var date = inst.options.calendar.determineDate(
					dates[i], null, curDate, inst.get('dateFormat'), inst.getConfig());
				if (date) {
					if ((!minDate || date.compareTo(minDate) != -1) &&
							(!maxDate || date.compareTo(maxDate) != +1)) {
						var found = false;
						for (var j = 0; j < inst.selectedDates.length; j++) {
							if (inst.selectedDates[j].compareTo(date) == 0) {
								found = true;
								break;
							}
						}
						if (!found) {
							inst.selectedDates.push(date);
						}
					}
				}
			}
			inst.selectedDates.splice(inst.options.multiSelect ||
				(inst.options.rangeSelect ? 2 : 1), inst.selectedDates.length);
			if (inst.options.rangeSelect) {
				switch (inst.selectedDates.length) {
					case 1: inst.selectedDates[1] = inst.selectedDates[0]; break;
					case 2: inst.selectedDates[1] =
						(inst.selectedDates[0].compareTo(inst.selectedDates[1]) == +1 ?
						inst.selectedDates[0] : inst.selectedDates[1]); break;
				}
				inst.pickingRange = false;
			}
			inst.prevDate = (inst.drawDate ? inst.drawDate.newDate() : null);
			inst.drawDate = this._checkMinMax((inst.selectedDates[0] ||
				inst.get('defaultDate') || inst.options.calendar.today()).newDate(), inst);
			if (!setOpt) {
				this._update(target);
				this._updateInput(target, keyUp);
			}
		}
	},

	/* Determine whether a date is selectable for this datepicker.
	   @param  target  (element) the control to check
	   @param  date    (Date or string or number) the date to check
	   @return  (boolean) true if selectable, false if not */
	_isSelectablePlugin: function(target, date) {
		var inst = $.data(target, this.propertyName);
		if (!inst) {
			return false;
		}
		date = inst.options.calendar.determineDate(date,
			inst.selectedDates[0] || inst.options.calendar.today(), null,
			inst.get('dateFormat'), inst.getConfig());
		return this._isSelectable(target, date, inst.options.onDate,
			inst.get('minDate'), inst.get('maxDate'));
	},

	/* Internally determine whether a date is selectable for this datepicker.
	   @param  target   (element) the control to check
	   @param  date     (Date) the date to check
	   @param  onDate   (function or boolean) any onDate callback or callback.selectable
	   @param  mindate  (Date) the minimum allowed date
	   @param  maxdate  (Date) the maximum allowed date
	   @return  (boolean) true if selectable, false if not */
	_isSelectable: function(target, date, onDate, minDate, maxDate) {
		var dateInfo = (typeof onDate == 'boolean' ? {selectable: onDate} :
			(!$.isFunction(onDate) ? {} : onDate.apply(target, [date, true])));
		return (dateInfo.selectable != false) &&
			(!minDate || date.toJD() >= minDate.toJD()) &&
			(!maxDate || date.toJD() <= maxDate.toJD());
	},

	/* Perform a named action for a calendar picker.
	   @param  target  (element) the control to affect
	   @param  action  (string) the name of the action */
	_performActionPlugin: function(target, action) {
		var inst = $.data(target, this.propertyName);
		if (inst && !this._isDisabledPlugin(target)) {
			var commands = inst.options.commands;
			if (commands[action] && commands[action].enabled.apply(target, [inst])) {
				commands[action].action.apply(target, [inst]);
			}
		}
	},

	/* Set the currently shown month, defaulting to today's.
	   @param  target  (element) the control to affect
	   @param  year    (number) the year to show (optional)
	   @param  month   (number) the month to show (optional)
	   @param  day     (number) the day to show (optional) */
	_showMonthPlugin: function(target, year, month, day) {
		var inst = $.data(target, this.propertyName);
		if (inst && (day != null ||
				(inst.drawDate.year() != year || inst.drawDate.month() != month))) {
			inst.prevDate = inst.drawDate.newDate();
			var calendar = inst.options.calendar;
			var show = this._checkMinMax((year != null ?
				calendar.newDate(year, month, 1) : calendar.today()), inst);
			inst.drawDate.date(show.year(), show.month(), 
				(day != null ? day : Math.min(inst.drawDate.day(),
				calendar.daysInMonth(show.year(), show.month()))));
			this._update(target);
		}
	},

	/* Adjust the currently shown month.
	   @param  target  (element) the control to affect
	   @param  offset  (number) the number of months to change by */
	_changeMonthPlugin: function(target, offset) {
		var inst = $.data(target, this.propertyName);
		if (inst) {
			var date = inst.drawDate.newDate().add(offset, 'm');
			this._showMonthPlugin(target, date.year(), date.month());
		}
	},

	/* Adjust the currently shown day.
	   @param  target  (element) the control to affect
	   @param  offset  (number) the number of days to change by */
	_changeDayPlugin: function(target, offset) {
		var inst = $.data(target, this.propertyName);
		if (inst) {
			var date = inst.drawDate.newDate().add(offset, 'd');
			this._showMonthPlugin(target, date.year(), date.month(), date.day());
		}
	},

	/* Restrict a date to the minimum/maximum specified.
	   @param  date  (CDate) the date to check
	   @param  inst  (object) the current instance settings */
	_checkMinMax: function(date, inst) {
		var minDate = inst.get('minDate');
		var maxDate = inst.get('maxDate');
		date = (minDate && date.compareTo(minDate) == -1 ? minDate.newDate() : date);
		date = (maxDate && date.compareTo(maxDate) == +1 ? maxDate.newDate() : date);
		return date;
	},

	/* Retrieve the date associated with an entry in the datepicker.
	   @param  target  (element) the control to examine
	   @param  elem    (element) the selected datepicker element
	   @return  (CDate) the corresponding date, or null */
	_retrieveDatePlugin: function(target, elem) {
		var inst = $.data(target, this.propertyName);
		return (!inst ? null : inst.options.calendar.fromJD(
			parseFloat(elem.className.replace(/^.*jd(\d+\.5).*$/, '$1'))));
	},

	/* Select a date for this datepicker.
	   @param  target  (element) the control to examine
	   @param  elem    (element) the selected datepicker element */
	_selectDatePlugin: function(target, elem) {
		var inst = $.data(target, this.propertyName);
		if (inst && !this._isDisabledPlugin(target)) {
			var date = this._retrieveDatePlugin(target, elem);
			if (inst.options.multiSelect) {
				var found = false;
				for (var i = 0; i < inst.selectedDates.length; i++) {
					if (date.compareTo(inst.selectedDates[i]) == 0) {
						inst.selectedDates.splice(i, 1);
						found = true;
						break;
					}
				}
				if (!found && inst.selectedDates.length < inst.options.multiSelect) {
					inst.selectedDates.push(date);
				}
			}
			else if (inst.options.rangeSelect) {
				if (inst.pickingRange) {
					inst.selectedDates[1] = date;
				}
				else {
					inst.selectedDates = [date, date];
				}
				inst.pickingRange = !inst.pickingRange;
			}
			else {
				inst.selectedDates = [date];
			}
			this._updateInput(target);
			if (inst.inline || inst.pickingRange || inst.selectedDates.length <
					(inst.options.multiSelect || (inst.options.rangeSelect ? 2 : 1))) {
				this._update(target);
			}
			else {
				this._hidePlugin(target);
			}
		}
	},

	/* Generate the datepicker content for this control.
	   @param  target  (element) the control to affect
	   @param  inst    (object) the current instance settings
	   @return  (jQuery) the datepicker content */
	_generateContent: function(target, inst) {
		var monthsToShow = inst.options.monthsToShow;
		monthsToShow = ($.isArray(monthsToShow) ? monthsToShow : [1, monthsToShow]);
		inst.drawDate = this._checkMinMax(
			inst.drawDate || inst.get('defaultDate') || inst.options.calendar.today(), inst);
		var drawDate = inst.drawDate.newDate().add(-inst.options.monthsOffset, 'm');
		// Generate months
		var monthRows = '';
		for (var row = 0; row < monthsToShow[0]; row++) {
			var months = '';
			for (var col = 0; col < monthsToShow[1]; col++) {
				months += this._generateMonth(target, inst, drawDate.year(),
					drawDate.month(), inst.options.calendar, inst.options.renderer, (row == 0 && col == 0));
				drawDate.add(1, 'm');
			}
			monthRows += this._prepare(inst.options.renderer.monthRow, inst).replace(/\{months\}/, months);
		}
		var picker = this._prepare(inst.options.renderer.picker, inst).replace(/\{months\}/, monthRows).
			replace(/\{weekHeader\}/g, this._generateDayHeaders(inst, inst.options.calendar, inst.options.renderer));
		// Add commands
		var addCommand = function(type, open, close, name, classes) {
			if (picker.indexOf('{' + type + ':' + name + '}') == -1) {
				return;
			}
			var command = inst.options.commands[name];
			var date = (inst.options.commandsAsDateFormat ? command.date.apply(target, [inst]) : null);
			picker = picker.replace(new RegExp('\\{' + type + ':' + name + '\\}', 'g'),
				'<' + open +
				(command.status ? ' title="' + inst.options[command.status] + '"' : '') +
				' class="' + inst.options.renderer.commandClass + ' ' +
				inst.options.renderer.commandClass + '-' + name + ' ' + classes +
				(command.enabled(inst) ? '' : ' ' + inst.options.renderer.disabledClass) + '">' +
				(date ? date.formatDate(inst.options[command.text]) : inst.options[command.text]) +
				'</' + close + '>');
		};
		for (var name in inst.options.commands) {
			addCommand('button', 'button type="button"', 'button', name,
				inst.options.renderer.commandButtonClass);
			addCommand('link', 'a href="javascript:void(0)"', 'a', name,
				inst.options.renderer.commandLinkClass);
		}
		picker = $(picker);
		if (monthsToShow[1] > 1) {
			var count = 0;
			$(inst.options.renderer.monthSelector, picker).each(function() {
				var nth = ++count % monthsToShow[1];
				$(this).addClass(nth == 1 ? 'first' : (nth == 0 ? 'last' : ''));
			});
		}
		// Add calendar behaviour
		var self = this;
		picker.find(inst.options.renderer.daySelector + ' a').hover(
				function() { $(this).addClass(inst.options.renderer.highlightedClass); },
				function() {
					(inst.inline ? $(this).parents('.' + self.markerClassName) : inst.div).
						find(inst.options.renderer.daySelector + ' a').
						removeClass(inst.options.renderer.highlightedClass);
				}).
			click(function() {
				self._selectDatePlugin(target, this);
			}).end().
			find('select.' + this._monthYearClass + ':not(.' + this._anyYearClass + ')').change(function() {
				var monthYear = $(this).val().split('/');
				self._showMonthPlugin(target, parseInt(monthYear[1], 10), parseInt(monthYear[0], 10));
			}).end().
			find('select.' + this._anyYearClass).click(function() {
				$(this).next('input').css({left: this.offsetLeft, top: this.offsetTop,
					width: this.offsetWidth, height: this.offsetHeight}).show().focus();
			}).end().
			find('input.' + self._monthYearClass).change(function() {
				try {
					var year = parseInt($(this).val(), 10);
					year = (isNaN(year) ? inst.drawDate.year() : year);
					self._showMonthPlugin(target, year, inst.drawDate.month(), inst.drawDate.day());
				}
				catch (e) {
					alert(e);
				}
			}).keydown(function(event) {
				if (event.keyCode == 27) { // Escape
					$(event.target).hide();
					inst.target.focus();
				}
			});
		// Add command behaviour
		picker.find('.' + inst.options.renderer.commandClass).click(function() {
				if (!$(this).hasClass(inst.options.renderer.disabledClass)) {
					var action = this.className.replace(
						new RegExp('^.*' + inst.options.renderer.commandClass + '-([^ ]+).*$'), '$1');
					plugin._performActionPlugin(target, action);
				}
			});
		// Add classes
		if (inst.options.isRTL) {
			picker.addClass(inst.options.renderer.rtlClass);
		}
		if (monthsToShow[0] * monthsToShow[1] > 1) {
			picker.addClass(inst.options.renderer.multiClass);
		}
		if (inst.options.pickerClass) {
			picker.addClass(inst.options.pickerClass);
		}
		// Resize
		$('body').append(picker);
		var width = 0;
		picker.find(inst.options.renderer.monthSelector).each(function() {
			width += $(this).outerWidth();
		});
		picker.width(width / monthsToShow[0]);
		// Pre-show customisation
		if ($.isFunction(inst.options.onShow)) {
			inst.options.onShow.apply(target, [picker, inst.options.calendar, inst]);
		}
		return picker;
	},

	/* Generate the content for a single month.
	   @param  target    (element) the control to affect
	   @param  inst      (object) the current instance settings
	   @param  year      (number) the year to generate
	   @param  month     (number) the month to generate
	   @param  calendar  (*Calendar) the current calendar
	   @param  renderer  (object) the rendering templates
	   @param  first     (boolean) true if first of multiple months
	   @return  (string) the month content */
	_generateMonth: function(target, inst, year, month, calendar, renderer, first) {
		var daysInMonth = calendar.daysInMonth(year, month);
		var monthsToShow = inst.options.monthsToShow;
		monthsToShow = ($.isArray(monthsToShow) ? monthsToShow : [1, monthsToShow]);
		var fixedWeeks = inst.options.fixedWeeks || (monthsToShow[0] * monthsToShow[1] > 1);
		var firstDay = inst.options.firstDay;
		firstDay = (firstDay == null ? calendar.local.firstDay : firstDay);
		var leadDays = (calendar.dayOfWeek(year, month, calendar.minDay) -
			firstDay + calendar.daysInWeek()) % calendar.daysInWeek();
		var numWeeks = (fixedWeeks ? 6 : Math.ceil((leadDays + daysInMonth) / calendar.daysInWeek()));
		var selectOtherMonths = inst.options.selectOtherMonths && inst.options.showOtherMonths;
		var minDate = (inst.pickingRange ? inst.selectedDates[0] : inst.get('minDate'));
		var maxDate = inst.get('maxDate');
		var showWeeks = renderer.week.indexOf('{weekOfYear}') > -1;
		var today = calendar.today();
		var drawDate = calendar.newDate(year, month, calendar.minDay);
		drawDate.add(-leadDays - (fixedWeeks &&
			(drawDate.dayOfWeek() == firstDay || drawDate.daysInMonth() < calendar.daysInWeek())?
			calendar.daysInWeek() : 0), 'd');
		var jd = drawDate.toJD();
		// Generate weeks
		var weeks = '';
		for (var week = 0; week < numWeeks; week++) {
			var weekOfYear = (!showWeeks ? '' : '<span class="jd' + jd + '">' +
				($.isFunction(inst.options.calculateWeek) ?
				inst.options.calculateWeek(drawDate) : drawDate.weekOfYear()) + '</span>');
			var days = '';
			for (var day = 0; day < calendar.daysInWeek(); day++) {
				var selected = false;
				if (inst.options.rangeSelect && inst.selectedDates.length > 0) {
					selected = (drawDate.compareTo(inst.selectedDates[0]) != -1 &&
						drawDate.compareTo(inst.selectedDates[1]) != +1);
				}
				else {
					for (var i = 0; i < inst.selectedDates.length; i++) {
						if (inst.selectedDates[i].compareTo(drawDate) == 0) {
							selected = true;
							break;
						}
					}
				}
				var dateInfo = (!$.isFunction(inst.options.onDate) ? {} :
					inst.options.onDate.apply(target, [drawDate, drawDate.month() == month]));
				var selectable = (selectOtherMonths || drawDate.month() == month) &&
					this._isSelectable(target, drawDate, dateInfo.selectable, minDate, maxDate);
				days += this._prepare(renderer.day, inst).replace(/\{day\}/g,
					(selectable ? '<a href="javascript:void(0)"' : '<span') +
					' class="jd' + jd + ' ' + (dateInfo.dateClass || '') +
					(selected && (selectOtherMonths || drawDate.month() == month) ?
					' ' + renderer.selectedClass : '') +
					(selectable ? ' ' + renderer.defaultClass : '') +
					(drawDate.weekDay() ? '' : ' ' + renderer.weekendClass) +
					(drawDate.month() == month ? '' : ' ' + renderer.otherMonthClass) +
					(drawDate.compareTo(today) == 0 && drawDate.month() == month ?
					' ' + renderer.todayClass : '') +
					(drawDate.compareTo(inst.drawDate) == 0 && drawDate.month() == month ?
					' ' + renderer.highlightedClass : '') + '"' +
					(dateInfo.title || (inst.options.dayStatus && selectable) ? ' title="' +
					(dateInfo.title || drawDate.formatDate(inst.options.dayStatus)) + '"' : '') + '>' +
					(inst.options.showOtherMonths || drawDate.month() == month ?
					dateInfo.content || drawDate.day() : '&nbsp;') +
					(selectable ? '</a>' : '</span>'));
				drawDate.add(1, 'd');
				jd++;
			}
			weeks += this._prepare(renderer.week, inst).replace(/\{days\}/g, days).
				replace(/\{weekOfYear\}/g, weekOfYear);
		}
		var monthHeader = this._prepare(renderer.month, inst).match(/\{monthHeader(:[^\}]+)?\}/);
		monthHeader = (monthHeader[0].length <= 13 ? 'MM yyyy' :
			monthHeader[0].substring(13, monthHeader[0].length - 1));
		monthHeader = (first ? this._generateMonthSelection(
			inst, year, month, minDate, maxDate, monthHeader, calendar, renderer) :
			calendar.formatDate(monthHeader, calendar.newDate(year, month, calendar.minDay)));
		var weekHeader = this._prepare(renderer.weekHeader, inst).
			replace(/\{days\}/g, this._generateDayHeaders(inst, calendar, renderer));
		return this._prepare(renderer.month, inst).replace(/\{monthHeader(:[^\}]+)?\}/g, monthHeader).
			replace(/\{weekHeader\}/g, weekHeader).replace(/\{weeks\}/g, weeks);
	},

	/* Generate the HTML for the day headers.
	   @param  inst      (object) the current instance settings
	   @param  calendar  (*Calendar) the current calendar
	   @param  renderer  (object) the rendering templates
	   @return  (string) a week's worth of day headers */
	_generateDayHeaders: function(inst, calendar, renderer) {
		var firstDay = inst.options.firstDay;
		firstDay = (firstDay == null ? calendar.local.firstDay : firstDay);
		var header = '';
		for (var day = 0; day < calendar.daysInWeek(); day++) {
			var dow = (day + firstDay) % calendar.daysInWeek();
			header += this._prepare(renderer.dayHeader, inst).replace(/\{day\}/g,
				'<span class="' + this._curDoWClass + dow + '" title="' +
				calendar.local.dayNames[dow] + '">' +
				calendar.local.dayNamesMin[dow] + '</span>');
		}
		return header;
	},

	/* Generate selection controls for month.
	   @param  inst         (object) the current instance settings
	   @param  year         (number) the year to generate
	   @param  month        (number) the month to generate
	   @param  minDate      (CDate) the minimum date allowed
	   @param  maxDate      (CDate) the maximum date allowed
	   @param  monthHeader  (string) the month/year format
	   @param  calendar     (*Calendar) the current calendar
	   @return  (string) the month selection content */
	_generateMonthSelection: function(inst, year, month, minDate, maxDate, monthHeader, calendar) {
		if (!inst.options.changeMonth) {
			return calendar.formatDate(monthHeader, calendar.newDate(year, month, 1));
		}
		// Months
		var monthNames = calendar.local[
			'monthNames' + (monthHeader.match(/mm/i) ? '' : 'Short')];
		var html = monthHeader.replace(/m+/i, '\\x2E').replace(/y+/i, '\\x2F');
		var selector = '<div class="dw-dropDownList dw-calendar month"><select class="' + this._monthYearClass +
			'" title="' + inst.options.monthStatus + '">';
		var maxMonth = calendar.monthsInYear(year) + calendar.minMonth;
		for (var m = calendar.minMonth; m < maxMonth; m++) {
			if ((!minDate || calendar.newDate(year, m,
					calendar.daysInMonth(year, m) - 1 + calendar.minDay).
					compareTo(minDate) != -1) &&
					(!maxDate || calendar.newDate(year, m, calendar.minDay).
					compareTo(maxDate) != +1)) {
				selector += '<option value="' + m + '/' + year + '"' +
					(month == m ? ' selected="selected"' : '') + '>' +
					monthNames[m - calendar.minMonth] + '</option>';
			}
		}
		selector += '</select></div>';
		html = html.replace(/\\x2E/, selector);
		// Years
		var yearRange = inst.options.yearRange;
		if (yearRange == 'any') {
		    selector = '<div class="dw-dropDownList dw-calendar year"><select class="' + this._monthYearClass + ' ' + this._anyYearClass +
				'" title="' + inst.options.yearStatus + '">' +
				'<option>' + year + '</option></select></div>' +
				'<input class="' + this._monthYearClass + ' ' + this._curMonthClass +
				month + '" value="' + year + '">';
		}
		else {
			yearRange = yearRange.split(':');
			var todayYear = calendar.today().year();
			var start = (yearRange[0].match('c[+-].*') ? year + parseInt(yearRange[0].substring(1), 10) :
				((yearRange[0].match('[+-].*') ? todayYear : 0) + parseInt(yearRange[0], 10)));
			var end = (yearRange[1].match('c[+-].*') ? year + parseInt(yearRange[1].substring(1), 10) :
				((yearRange[1].match('[+-].*') ? todayYear : 0) + parseInt(yearRange[1], 10)));
			selector = '<div class="dw-dropDownList dw-calendar year"><select class="' + this._monthYearClass +
				'" title="' + inst.options.yearStatus + '">';
			start = calendar.newDate(start + 1, calendar.firstMonth, calendar.minDay).add(-1, 'd');
			end = calendar.newDate(end, calendar.firstMonth, calendar.minDay);
			var addYear = function(y) {
				if (y != 0 || calendar.hasYearZero) {
					selector += '<option value="' +
						Math.min(month, calendar.monthsInYear(y) - 1 + calendar.minMonth) +
						'/' + y + '"' + (year == y ? ' selected="selected"' : '') + '>' +
						y + '</option>';
				}
			};
			if (start.toJD() < end.toJD()) {
				start = (minDate && minDate.compareTo(start) == +1 ? minDate : start).year();
				end = (maxDate && maxDate.compareTo(end) == -1 ? maxDate : end).year();
				for (var y = start; y <= end; y++) {
					addYear(y);
				}
			}
			else {
				start = (maxDate && maxDate.compareTo(start) == -1 ? maxDate : start).year();
				end = (minDate && minDate.compareTo(end) == +1 ? minDate : end).year();
				for (var y = start; y >= end; y--) {
					addYear(y);
				}
			}
			selector += '</select></div>';
		}
		html = html.replace(/\\x2F/, selector);
		return html;
	},

	/* Prepare a render template for use.
	   Exclude popup/inline sections that are not applicable.
	   Localise text of the form: {l10n:name}.
	   @param  text  (string) the text to localise
	   @param  inst  (object) the current instance settings
	   @return  (string) the localised text */
	_prepare: function(text, inst) {
		var replaceSection = function(type, retain) {
			while (true) {
				var start = text.indexOf('{' + type + ':start}');
				if (start == -1) {
					return;
				}
				var end = text.substring(start).indexOf('{' + type + ':end}');
				if (end > -1) {
					text = text.substring(0, start) +
						(retain ? text.substr(start + type.length + 8, end - type.length - 8) : '') +
						text.substring(start + end + type.length + 6);
				}
			}
		};
		replaceSection('inline', inst.inline);
		replaceSection('popup', !inst.inline);
		var pattern = /\{l10n:([^\}]+)\}/;
		var matches = null;
		while (matches = pattern.exec(text)) {
			text = text.replace(matches[0], inst.options[matches[1]]);
		}
		return text;
	}
});

// The list of commands that return values and don't permit chaining
var getters = ['getDate', 'isDisabled', 'isSelectable', 'retrieveDate'];

/* Determine whether a command is a getter and doesn't permit chaining.
   @param  command    (string, optional) the command to run
   @param  otherArgs  ([], optional) any other arguments for the command
   @return  true if the command is a getter, false if not */
function isNotChained(command, otherArgs) {
	if (command == 'option' && (otherArgs.length == 0 ||
			(otherArgs.length == 1 && typeof otherArgs[0] == 'string'))) {
		return true;
	}
	return $.inArray(command, getters) > -1;
}

/* Attach the calendar picker functionality to a jQuery selection.
   @param  options  (object) the new settings to use for these instances (optional) or
                    (string) the command to run (optional)
   @return  (jQuery) for chaining further calls or
            (any) getter value */
$.fn.calendarsPicker = function(options) {
	var otherArgs = Array.prototype.slice.call(arguments, 1);
	if (isNotChained(options, otherArgs)) {
		return plugin['_' + options + 'Plugin'].apply(plugin, [this[0]].concat(otherArgs));
	}
	return this.each(function() {
		if (typeof options == 'string') {
			if (!plugin['_' + options + 'Plugin']) {
				throw 'Unknown command: ' + options;
			}
			plugin['_' + options + 'Plugin'].apply(plugin, [this].concat(otherArgs));
		}
		else {
			plugin._attachPlugin(this, options || {});
		}
	});
};

/* Initialise the calendar picker functionality. */
var plugin = $.calendars.picker = new CalendarsPicker(); // Singleton instance

$(function() {
	$(document).mousedown(plugin._checkExternalClick).
		resize(function() { plugin._hidePlugin(plugin.curInst); });
});

})(jQuery);

/* http://keith-wood.name/calendars.html
   Calendars date picker extensions for jQuery v1.2.1.
   Written by Keith Wood (kbwood{at}iinet.com.au) August 2009.
   Available under the MIT (https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt) license. 
   Please attribute the author if you use it. */

(function($) { // Hide scope, no $ conflict

var themeRollerRenderer = {
	picker: '<div{popup:start} id="ui-datepicker-div"{popup:end} class="ui-datepicker ui-widget ' +
	'ui-widget-content ui-helper-clearfix ui-corner-all{inline:start} ui-datepicker-inline{inline:end}">' +
	'<div class="ui-datepicker-header ui-widget-header ui-helper-clearfix ui-corner-all">' +
	'{link:prev}{link:today}{link:next}</div>{months}' +
	'{popup:start}<div class="ui-datepicker-header ui-widget-header ui-helper-clearfix ' +
	'ui-corner-all">{button:clear}{button:close}</div>{popup:end}' +
	'<div class="ui-helper-clearfix"></div></div>',
	monthRow: '<div class="ui-datepicker-row-break">{months}</div>',
	month: '<div class="ui-datepicker-group">' +
	'<div class="ui-datepicker-header ui-widget-header ui-helper-clearfix ui-corner-all">{monthHeader:MM yyyy}</div>' +
	'<table class="ui-datepicker-calendar"><thead>{weekHeader}</thead><tbody>{weeks}</tbody></table></div>',
	weekHeader: '<tr>{days}</tr>',
	dayHeader: '<th>{day}</th>',
	week: '<tr>{days}</tr>',
	day: '<td>{day}</td>',
	monthSelector: '.ui-datepicker-group',
	daySelector: 'td',
	rtlClass: 'ui-datepicker-rtl',
	multiClass: 'ui-datepicker-multi',
	defaultClass: 'ui-state-default',
	selectedClass: 'ui-state-active',
	highlightedClass: 'ui-state-hover',
	todayClass: 'ui-state-highlight',
	otherMonthClass: 'ui-datepicker-other-month',
	weekendClass: 'ui-datepicker-week-end',
	commandClass: 'ui-datepicker-cmd',
	commandButtonClass: 'ui-state-default ui-corner-all',
	commandLinkClass: '',
	disabledClass: 'ui-datepicker-disabled'
};

$.extend($.calendars.picker, {

	// Template for generating a calendar picker showing week of year.
	weekOfYearRenderer: $.extend({}, $.calendars.picker.defaultRenderer, {
		weekHeader: '<tr><th class="calendars-week">' +
		'<span title="{l10n:weekStatus}">{l10n:weekText}</span></th>{days}</tr>',
		week: '<tr><td class="calendars-week">{weekOfYear}</td>{days}</tr>'
	}),

	// ThemeRoller template for generating a calendar picker.
	themeRollerRenderer: themeRollerRenderer,

	// ThemeRoller template for generating a calendar picker showing week of year.
	themeRollerWeekOfYearRenderer: $.extend({}, themeRollerRenderer, {
		weekHeader: '<tr><th class="ui-state-hover"><span>{l10n:weekText}</span></th>{days}</tr>',
		week: '<tr><td class="ui-state-hover">{weekOfYear}</td>{days}</tr>'
	}),

	/* Don't allow weekends to be selected.
	   Usage: onDate: $.calendars.picker.noWeekends.
	   @param  date  (CDate) the current date
	   @return  (object) information about this date */
	noWeekends: function(date) {
		return {selectable: date.weekDay()};
	},

	/* Change the first day of the week by clicking on the day header.
	   Usage: onShow: $.calendars.picker.changeFirstDay.
	   @param  picker    (jQuery) the completed datepicker division
	   @param  calendar  (*Calendar) the calendar implementation
	   @param  inst      (object) the current instance settings */
	changeFirstDay: function(picker, calendar, inst) {
		var target = $(this);
		picker.find('th span').each(function() {
			if (this.parentNode.className.match(/.*calendars-week.*/)) {
				return;
			}
			$('<a href="javascript:void(0)" class="' + this.className +
					'" title="Change first day of the week">' + $(this).text() + '</a>').
				click(function() {
					var dow = parseInt(this.className.replace(/^.*calendars-dow-(\d+).*$/, '$1'), 10);
					target.calendarsPicker('option', {firstDay: dow});
				}).
				replaceAll(this);
		});
	},

	/* Add a callback when hovering over dates.
	   Usage: onShow: $.calendars.picker.hoverCallback(handleHover).
	   @param  onHover  (function) the callback when hovering,
	                    it receives the current date and a flag indicating selectability
	                    as parameters on entry, and no parameters on exit,
	                    this refers to the target input or division */
	hoverCallback: function(onHover) {
		return function(picker, calendar, inst) {
			if ($.isFunction(onHover)) {
				var target = this;
				var renderer = inst.options.renderer;
				picker.find(renderer.daySelector + ' a, ' + renderer.daySelector + ' span').
					hover(function() {
						onHover.apply(target, [$(target).calendarsPicker('retrieveDate', this),
							this.nodeName.toLowerCase() == 'a']);
					},
					function() { onHover.apply(target, []); });
			}
		};
	},

	/* Highlight the entire week when hovering over it.
	   Usage: onShow: $.calendars.picker.highlightWeek.
	   @param  picker    (jQuery) the completed datepicker division
	   @param  calendar  (*Calendar) the calendar implementation
	   @param  inst      (object) the current instance settings */
	highlightWeek: function(picker, calendar, inst) {
		var target = this;
		var renderer = inst.options.renderer;
		picker.find(renderer.daySelector + ' a, ' + renderer.daySelector + ' span').
			hover(function() {
				$(this).parents('tr').find(renderer.daySelector + ' *').
					addClass(renderer.highlightedClass);
			},
			function() {
				$(this).parents('tr').find(renderer.daySelector + ' *').
					removeClass(renderer.highlightedClass);
			});
	},

	/* Show a status bar with messages.
	   Usage: onShow: $.calendars.picker.showStatus.
	   @param  picker    (jQuery) the completed datepicker division
	   @param  calendar  (*Calendar) the calendar implementation
	   @param  inst      (object) the current instance settings */
	showStatus: function(picker, calendar, inst) {
		var isTR = (inst.options.renderer.selectedClass == 'ui-state-active');
		var defaultStatus = inst.options.defaultStatus || '&nbsp;';
		var status = $('<div class="' + (!isTR ? 'calendars-status' :
			'ui-datepicker-status ui-widget-header ui-helper-clearfix ui-corner-all') + '">' +
			defaultStatus + '</div>').
			insertAfter(picker.find('.calendars-month-row:last,.ui-datepicker-row-break:last'));
		picker.find('*[title]').each(function() {
				var title = $(this).attr('title');
				$(this).removeAttr('title').hover(
					function() { status.text(title || defaultStatus); },
					function() { status.text(defaultStatus); });
			});
	},

	/* Allow easier navigation by month.
	   Usage: onShow: $.calendars.picker.monthNavigation.
	   @param  picker    (jQuery) the completed datepicker division
	   @param  calendar  (*Calendar) the calendar implementation
	   @param  inst      (object) the current instance settings */
	monthNavigation: function(picker, calendar, inst) {
		var target = $(this);
		var isTR = (inst.options.renderer.selectedClass == 'ui-state-active');
		var minDate = inst.curMinDate();
		var maxDate = inst.get('maxDate');
		var year = inst.drawDate.year();
		var html = '<div class="' + (!isTR ? 'calendars-month-nav' : 'ui-datepicker-month-nav') + '">';
		for (var i = 0; i < calendar.monthsInYear(year); i++) {
			var ord = calendar.fromMonthOfYear(year, i + calendar.minMonth) - calendar.minMonth;
			var inRange = ((!minDate || calendar.newDate(year, i + calendar.minMonth,
				calendar.daysInMonth(year, i + calendar.minMonth)).compareTo(minDate) > -1) && (!maxDate ||
				calendar.newDate(year, i + calendar.minMonth, calendar.minDay).compareTo(maxDate) < +1));
			html += '<div>' + (inRange ? '<a href="#" class="jd' +
				calendar.newDate(year, i + calendar.minMonth, calendar.minDay).toJD() + '"' : '<span') +
				' title="' + calendar.local.monthNames[ord] + '">' + calendar.local.monthNamesShort[ord] +
				(inRange ? '</a>' : '</span>') + '</div>';
		}
		html += '</div>';
		$(html).insertAfter(picker.find('div.calendars-nav,div.ui-datepicker-header:first')).
			find('a').click(function() {
				var date = target.calendarsPicker('retrieveDate', this);
				target.calendarsPicker('showMonth', date.year(), date.month());
				return false;
			});
	},

	/* Select an entire week when clicking on a week number.
	   Use in conjunction with weekOfYearRenderer.
	   Usage: onShow: $.calendars.picker.selectWeek.
	   @param  picker    (jQuery) the completed datepicker division
	   @param  calendar  (*Calendar) the calendar implementation
	   @param  inst      (object) the current instance settings */
	selectWeek: function(picker, calendar, inst) {
		var target = $(this);
		picker.find('td.calendars-week span').each(function() {
			$('<a href="javascript:void(0)" class="' +
					this.className + '" title="Select the entire week">' +
					$(this).text() + '</a>').
				click(function() {
					var date = target.calendarsPicker('retrieveDate', this);
					var dates = [date];
					for (var i = 1; i < calendar.daysInWeek(); i++) {
						dates.push(date = date.newDate().add(1, 'd'));
					}
					if (inst.options.rangeSelect) {
						dates.splice(1, dates.length - 2);
					}
					target.calendarsPicker('setDate', dates).calendarsPicker('hide');
				}).
				replaceAll(this);
		});
	},

	/* Select an entire month when clicking on the week header.
	   Use in conjunction with weekOfYearRenderer.
	   Usage: onShow: $.calendars.picker.selectMonth.
	   @param  picker    (jQuery) the completed datepicker division
	   @param  calendar  (*Calendar) the calendar implementation
	   @param  inst      (object) the current instance settings */
	selectMonth: function(picker, calendar, inst) {
		var target = $(this);
		picker.find('th.calendars-week').each(function() {
			$('<a href="javascript:void(0)" title="Select the entire month">' +
					$(this).text() + '</a>').
				click(function() {
					var date = target.calendarsPicker('retrieveDate', $(this).parents('table').
						find('td:not(.calendars-week) *:not(.calendars-other-month)')[0]);
					var dates = [date.day(1)];
					var dim = calendar.daysInMonth(date);
					for (var i = 1; i < dim; i++) {
						dates.push(date = date.newDate().add(1, 'd'));
					}
					if (inst.options.rangeSelect) {
						dates.splice(1, dates.length - 2);
					}
					target.calendarsPicker('setDate', dates).calendarsPicker('hide');
				}).
				appendTo(this);
		});
	},

	/* Select a month only instead of a single day.
	   Usage: onShow: $.calendars.picker.monthOnly.
	   @param  picker    (jQuery) the completed datepicker division
	   @param  calendar  (*Calendar) the calendar implementation
	   @param  inst      (object) the current instance settings */
	monthOnly: function(picker, calendar, inst) {
		var target = $(this);
		var selectMonth = $('<div style="text-align: center;"><button type="button">Select</button></div>').
			insertAfter(picker.find('.calendars-month-row:last,.ui-datepicker-row-break:last')).
			children().click(function() {
				var monthYear = picker.find('.calendars-month-year:first').val().split('/');
				target.calendarsPicker('setDate', calendar.newDate(
					parseInt(monthYear[1], 10), parseInt(monthYear[0], 10), calendar.minDay)).
					calendarsPicker('hide');
			});
		picker.find('.calendars-month-row table,.ui-datepicker-row-break table').remove();
	}
});

})(jQuery);

/* http://keith-wood.name/calendars.html
   Arabic localisation for calendars datepicker for jQuery.
   Khaled Al Horani -- خالد الحوراني -- koko.dw@gmail.com */
(function($) {
	$.calendars.picker.regional['ar'] = {
		renderer: $.calendars.picker.defaultRenderer,
		prevText: '&#x3c;السابق', prevStatus: 'عرض الشهر السابق',
		prevJumpText: '&#x3c;&#x3c;', prevJumpStatus: '',
		nextText: 'التالي&#x3e;', nextStatus: 'عرض الشهر القادم',
		nextJumpText: '&#x3e;&#x3e;', nextJumpStatus: '',
		currentText: 'اليوم', currentStatus: 'عرض الشهر الحالي',
		todayText: 'اليوم', todayStatus: 'عرض الشهر الحالي',
		clearText: 'مسح', clearStatus: 'امسح التاريخ الحالي',
		closeText: 'إغلاق', closeStatus: 'إغلاق بدون حفظ',
		yearStatus: 'عرض سنة آخرى', monthStatus: 'عرض شهر آخر',
		weekText: 'أسبوع', weekStatus: 'أسبوع السنة',
		dayStatus: 'اختر D, M d', defaultStatus: 'اختر يوم',
		isRTL: true
	};
	$.calendars.picker.setDefaults($.calendars.picker.regional['ar']);
})(jQuery);

/* http://keith-wood.name/calendars.html
   Bulgarian localisation for calendars datepicker for jQuery.
   Written by Stoyan Kyosev (http://svest.org). */
(function($) {
	$.calendars.picker.regional['bg'] = {
		renderer: $.calendars.picker.defaultRenderer,
        prevText: '&#x3c;назад', prevStatus: 'покажи последния месец',
		prevJumpText: '&#x3c;&#x3c;', prevJumpStatus: '',
        nextText: 'напред&#x3e;', nextStatus: 'покажи следващия месец',
		nextJumpText: '&#x3e;&#x3e;', nextJumpStatus: '',
        currentText: 'днес', currentStatus: '',
		todayText: 'днес', todayStatus: '',
		clearText: 'изчисти', clearStatus: 'изчисти актуалната дата',
        closeText: 'затвори', closeStatus: 'затвори без промени',
		yearStatus: 'покажи друга година', monthStatus: 'покажи друг месец',
		weekText: 'Wk', weekStatus: 'седмица от месеца',
		dayStatus: 'Избери D, M d', defaultStatus: 'Избери дата',
		isRTL: false
	};
	$.calendars.picker.setDefaults($.calendars.picker.regional['bg']);
})(jQuery);

/* http://keith-wood.name/calendars.html
   German localisation for calendars datepicker for jQuery.
   Written by Milian Wolff (mail@milianw.de). */
(function($) {
	$.calendars.picker.regional['de'] = {
		renderer: $.calendars.picker.defaultRenderer,
		prevText: '&#x3c;zurück', prevStatus: 'letzten Monat zeigen',
		prevJumpText: '&#x3c;&#x3c;', prevJumpStatus: '',
		nextText: 'Vor&#x3e;', nextStatus: 'nächsten Monat zeigen',
		nextJumpText: '&#x3e;&#x3e;', nextJumpStatus: '',
		currentText: 'heute', currentStatus: '',
		todayText: 'heute', todayStatus: '',
		clearText: 'löschen', clearStatus: 'aktuelles Datum löschen',
		closeText: 'schließen', closeStatus: 'ohne Änderungen schließen',
		yearStatus: 'anderes Jahr anzeigen', monthStatus: 'anderen Monat anzeige',
		weekText: 'Wo', weekStatus: 'Woche des Monats',
		dayStatus: 'Wähle D, M d', defaultStatus: 'Wähle ein Datum',
		isRTL: false
	};
	$.calendars.picker.setDefaults($.calendars.picker.regional['de']);
})(jQuery);

/* http://keith-wood.name/calendars.html
   Greek localisation for calendars datepicker for jQuery.
   Written by Alex Cicovic (http://www.alexcicovic.com). */
(function($) {
	$.calendars.picker.regional['el'] = {
		renderer: $.calendars.picker.defaultRenderer,
		prevText: 'Προηγούμενος', prevStatus: 'Επισκόπηση προηγούμενου μήνα',
		prevJumpText: '&#x3c;&#x3c;', prevJumpStatus: '',
		nextText: 'Επόμενος', nextStatus: 'Επισκόπηση επόμενου μήνα',
		nextJumpText: '&#x3e;&#x3e;', nextJumpStatus: '',
		currentText: 'Τρέχων Μήνας', currentStatus: 'Επισκόπηση τρέχοντος μήνα',
		todayText: 'Τρέχων Μήνας', todayStatus: 'Επισκόπηση τρέχοντος μήνα',
		clearText: 'Σβήσιμο', clearStatus: 'Σβήσιμο της επιλεγμένης ημερομηνίας',
		closeText: 'Κλείσιμο', closeStatus: 'Κλείσιμο χωρίς αλλαγή',
		yearStatus: 'Επισκόπηση άλλου έτους', monthStatus: 'Επισκόπηση άλλου μήνα',
		weekText: 'Εβδ', weekStatus: '',
		dayStatus: 'Επιλογή DD d MM', defaultStatus: 'Επιλέξτε μια ημερομηνία',
		isRTL: false
	};
	$.calendars.picker.setDefaults($.calendars.picker.regional['el']);
})(jQuery);

/* http://keith-wood.name/calendars.html
   English/UK localisation for calendars datepicker for jQuery.
   Stuart. */
(function($) {
	$.calendars.picker.regional['en-GB'] = {
		renderer: $.calendars.picker.defaultRenderer,
		prevText: 'Prev', prevStatus: 'Show the previous month',
		prevJumpText: '&lt;&lt;', prevJumpStatus: 'Show the previous year',
		nextText: 'Next', nextStatus: 'Show the next month',
		nextJumpText: '&gt;&gt;', nextJumpStatus: 'Show the next year',
		currentText: 'Current', currentStatus: 'Show the current month',
		todayText: 'Today', todayStatus: 'Show today\'s month',
		clearText: 'Clear', clearStatus: 'Clear all the dates',
		closeText: 'Done', closeStatus: 'Close the datepicker',
		yearStatus: 'Change the year', monthStatus: 'Change the month',
		weekText: 'Wk', weekStatus: 'Week of the year',
		dayStatus: 'Select DD, M d, yyyy', defaultStatus: 'Select a date',
		isRTL: false
	};
	$.calendars.picker.setDefaults($.calendars.picker.regional['en-GB']);
})(jQuery);

/* http://keith-wood.name/calendars.html
   Spanish localisation for calendars datepicker for jQuery.
   Traducido por Vester (xvester@gmail.com). */
(function($) {
	$.calendars.picker.regional['es'] = {
		renderer: $.calendars.picker.defaultRenderer,
		prevText: '&#x3c;Ant', prevStatus: '',
		prevJumpText: '&#x3c;&#x3c;', prevJumpStatus: '',
		nextText: 'Sig&#x3e;', nextStatus: '',
		nextJumpText: '&#x3e;&#x3e;', nextJumpStatus: '',
		currentText: 'Hoy', currentStatus: '',
		todayText: 'Hoy', todayStatus: '',
		clearText: 'Limpiar', clearStatus: '',
		closeText: 'Cerrar', closeStatus: '',
		yearStatus: '', monthStatus: '',
		weekText: 'Sm', weekStatus: '',
		dayStatus: 'DD, M d', defaultStatus: '',
		isRTL: false
	};
	$.calendars.picker.setDefaults($.calendars.picker.regional['es']);
})(jQuery);

/* http://keith-wood.name/calendars.html
   French localisation for calendars datepicker for jQuery.
   Stéphane Nahmani (sholby@sholby.net). */
(function($) {
	$.calendars.picker.regional['fr'] = {
		renderer: $.calendars.picker.defaultRenderer,
		prevText: '&#x3c;Préc', prevStatus: 'Voir le mois précédent',
		prevJumpText: '&#x3c;&#x3c;', prevJumpStatus: 'Voir l\'année précédent',
		nextText: 'Suiv&#x3e;', nextStatus: 'Voir le mois suivant',
		nextJumpText: '&#x3e;&#x3e;', nextJumpStatus: 'Voir l\'année suivant',
		currentText: 'Courant', currentStatus: 'Voir le mois courant',
		todayText: 'Aujourd\'hui', todayStatus: 'Voir aujourd\'hui',
		clearText: 'Effacer', clearStatus: 'Effacer la date sélectionnée',
		closeText: 'Fermer', closeStatus: 'Fermer sans modifier',
		yearStatus: 'Voir une autre année', monthStatus: 'Voir un autre mois',
		weekText: 'Sm', weekStatus: 'Semaine de l\'année',
		dayStatus: '\'Choisir\' le DD d MM', defaultStatus: 'Choisir la date',
		isRTL: false
	};
	$.calendars.picker.setDefaults($.calendars.picker.regional['fr']);
})(jQuery);

/* http://keith-wood.name/calendars.html
   Croatian localisation for calendars datepicker for jQuery.
   Written by Vjekoslav Nesek. */
(function($) {
	$.calendars.picker.regional['hr'] = {
		renderer: $.calendars.picker.defaultRenderer,
		prevText: '&#x3c;', prevStatus: 'Prikaži prethodni mjesec',
		prevJumpText: '&#x3c;&#x3c;', prevJumpStatus: '',
		nextText: '&#x3e;', nextStatus: 'Prikaži slijedeći mjesec',
		nextJumpText: '&#x3e;&#x3e;', nextJumpStatus: '',
		currentText: 'Danas', currentStatus: 'Današnji datum',
		todayText: 'Danas', todayStatus: 'Današnji datum',
		clearText: 'izbriši', clearStatus: 'Izbriši trenutni datum',
		closeText: 'Zatvori', closeStatus: 'Zatvori kalendar',
		yearStatus: 'Prikaži godine', monthStatus: 'Prikaži mjesece',
		weekText: 'Tje', weekStatus: 'Tjedanr',
		dayStatus: '\'Datum\' DD, M d', defaultStatus: 'Odaberi datum',
		isRTL: false
	};
	$.calendars.picker.setDefaults($.calendars.picker.regional['hr']);
})(jQuery);

/* http://keith-wood.name/calendars.html
   Italian localisation for calendars datepicker for jQuery.
   Written by Apaella (apaella@gmail.com). */
(function($) {
	$.calendars.picker.regional['it'] = {
		renderer: $.calendars.picker.defaultRenderer,
		prevText: '&#x3c;Prec', prevStatus: 'Mese precedente',
		prevJumpText: '&#x3c;&#x3c;', prevJumpStatus: 'Mostra l\'anno precedente',
		nextText: 'Succ&#x3e;', nextStatus: 'Mese successivo',
		nextJumpText: '&#x3e;&#x3e;', nextJumpStatus: 'Mostra l\'anno successivo',
		currentText: 'Oggi', currentStatus: 'Mese corrente',
		todayText: 'Oggi', todayStatus: 'Mese corrente',
		clearText: 'Svuota', clearStatus: 'Annulla',
		closeText: 'Chiudi', closeStatus: 'Chiudere senza modificare',
		yearStatus: 'Seleziona un altro anno', monthStatus: 'Seleziona un altro mese',
		weekText: 'Sm', weekStatus: 'Settimana dell\'anno',
		dayStatus: '\'Seleziona\' DD, M d', defaultStatus: 'Scegliere una data',
		isRTL: false
	};
	$.calendars.picker.setDefaults($.calendars.picker.regional['it']);
})(jQuery);

/* http://keith-wood.name/calendars.html
   Japanese localisation for calendars datepicker for jQuery.
   Written by Kentaro SATO (kentaro@ranvis.com). */
(function($) {
	$.calendars.picker.regional['ja'] = {
		renderer: $.extend({}, $.calendars.picker.defaultRenderer,
			{month: $.calendars.picker.defaultRenderer.month.
				replace(/monthHeader/, 'monthHeader:yyyy年 MM')}),
		prevText: '&#x3c;前', prevStatus: '前月を表示します',
		prevJumpText: '&#x3c;&#x3c;', prevJumpStatus: '前年を表示します',
		nextText: '次&#x3e;', nextStatus: '翌月を表示します',
		nextJumpText: '&#x3e;&#x3e;', nextJumpStatus: '翌年を表示します',
		currentText: '今日', currentStatus: '今月を表示します',
		todayText: '今日', todayStatus: '今月を表示します',
		clearText: 'クリア', clearStatus: '日付をクリアします',
		closeText: '閉じる', closeStatus: '変更せずに閉じます',
		yearStatus: '表示する年を変更します', monthStatus: '表示する月を変更します',
		weekText: '週', weekStatus: '暦週で第何週目かを表します',
		dayStatus: 'yyyy/mm/dd', defaultStatus: '日付を選択します',
		isRTL: false
	};
	$.calendars.picker.setDefaults($.calendars.picker.regional['ja']);
})(jQuery);

/* http://keith-wood.name/calendars.html
   Dutch localisation for calendars datepicker for jQuery.
   Written by Mathias Bynens <http://mathiasbynens.be/>. */
(function($) {
	$.calendars.picker.regional['nl'] = {
		renderer: $.calendars.picker.defaultRenderer,
		prevText: '←', prevStatus: 'Bekijk de vorige maand',
		prevJumpText: '«', nextJumpStatus: 'Bekijk het vorige jaar',
		nextText: '→', nextStatus: 'Bekijk de volgende maand',
		nextJumpText: '»', nextJumpStatus: 'Bekijk het volgende jaar',
		currentText: 'Vandaag', currentStatus: 'Bekijk de huidige maand',
		todayText: 'Vandaag', todayStatus: 'Bekijk de huidige maand',
		clearText: 'Wissen', clearStatus: 'Wis de huidige datum',
		closeText: 'Sluiten', closeStatus: 'Sluit zonder verandering',
		yearStatus: 'Bekijk een ander jaar', monthStatus: 'Bekijk een andere maand',
		weekText: 'Wk', weekStatus: 'Week van het jaar',
		dayStatus: 'dd-mm-yyyy', defaultStatus: 'Kies een datum',
		isRTL: false
	};
	$.calendars.picker.setDefaults($.calendars.picker.regional['nl']);
})(jQuery);

/* http://keith-wood.name/calendars.html
   Polish localisation for calendars datepicker for jQuery.
   Written by Jacek Wysocki (jacek.wysocki@gmail.com). */
(function($) {
	$.calendars.picker.regional['pl'] = {
		renderer: $.calendars.picker.defaultRenderer,
		prevText: '&#x3c;Poprzedni', prevStatus: 'Pokaż poprzedni miesiąc',
		prevJumpText: '&#x3c;&#x3c;', prevJumpStatus: '',
		nextText: 'Następny&#x3e;', nextStatus: 'Pokaż następny miesiąc',
		nextJumpText: '&#x3e;&#x3e;', nextJumpStatus: '',
		currentText: 'Dziś', currentStatus: 'Pokaż aktualny miesiąc',
		todayText: 'Dziś', todayStatus: 'Pokaż aktualny miesiąc',
		clearText: 'Wyczyść', clearStatus: 'Wyczyść obecną datę',
		closeText: 'Zamknij', closeStatus: 'Zamknij bez zapisywania',
		yearStatus: 'Pokaż inny rok', monthStatus: 'Pokaż inny miesiąc',
		weekText: 'Tydz', weekStatus: 'Tydzień roku',
		dayStatus: '\'Wybierz\' DD, M d', defaultStatus: 'Wybierz datę',
		isRTL: false
	};
	$.calendars.picker.setDefaults($.calendars.picker.regional['pl']);
})(jQuery);

/* http://keith-wood.name/calendars.html
   Brazilian Portuguese localisation for calendars datepicker for jQuery.
   Written by Leonildo Costa Silva (leocsilva@gmail.com). */
(function($) {
	$.calendars.picker.regional['pt-BR'] = {
		renderer: $.calendars.picker.defaultRenderer,
		prevText: '&lt;Anterior', prevStatus: 'Mostra o mês anterior', 
		prevJumpText: '&lt;&lt;', prevJumpStatus: 'Mostra o ano anterior', 
		nextText: 'Próximo&gt;', nextStatus: 'Mostra o próximo mês', 
		nextJumpText: '&gt;&gt;', nextJumpStatus: 'Mostra o próximo ano',
		currentText: 'Atual', currentStatus: 'Mostra o mês atual',
		todayText: 'Hoje', todayStatus: 'Vai para hoje', 
		clearText: 'Limpar', clearStatus: 'Limpar data',
		closeText: 'Fechar', closeStatus: 'Fechar o calendário',
		yearStatus: 'Selecionar ano', monthStatus: 'Selecionar mês',
		weekText: 's', weekStatus: 'Semana do ano', 
		dayStatus: 'DD, d \'de\' M \'de\' yyyy', defaultStatus: 'Selecione um dia',
		isRTL: false
	};
	$.calendars.picker.setDefaults($.calendars.picker.regional['pt-BR']);
})(jQuery);

/* http://keith-wood.name/calendars.html
   Russian localisation for calendars datepicker for jQuery.
   Written by Andrew Stromnov (stromnov@gmail.com). */
(function($) {
	$.calendars.picker.regional['ru'] = {
		renderer: $.calendars.picker.defaultRenderer,
		prevText: '&#x3c;Пред',  prevStatus: '',
		prevJumpText: '&#x3c;&#x3c;', prevJumpStatus: '',
		nextText: 'След&#x3e;', nextStatus: '',
		nextJumpText: '&#x3e;&#x3e;', nextJumpStatus: '',
		currentText: 'Сегодня', currentStatus: '',
		todayText: 'Сегодня', todayStatus: '',
		clearText: 'Очистить', clearStatus: '',
		closeText: 'Закрыть', closeStatus: '',
		yearStatus: '', monthStatus: '',
		weekText: 'Не', weekStatus: '',
		dayStatus: 'DD, M d', defaultStatus: '',
		isRTL: false
	};
	$.calendars.picker.setDefaults($.calendars.picker.regional['ru']);
})(jQuery);

/* http://keith-wood.name/calendars.html
   Swedish localisation for calendars datepicker for jQuery.
   Written by Anders Ekdahl ( anders@nomadiz.se). */
(function($) {
	$.calendars.picker.regional['sv'] = {
		renderer: $.calendars.picker.defaultRenderer,
        prevText: '&laquo;Förra',  prevStatus: '',
		prevJumpText: '&#x3c;&#x3c;', prevJumpStatus: '',
		nextText: 'Nästa&raquo;', nextStatus: '',
		nextJumpText: '&#x3e;&#x3e;', nextJumpStatus: '',
		currentText: 'Idag', currentStatus: '',
		todayText: 'Idag', todayStatus: '',
		clearText: 'Rensa', clearStatus: '',
		closeText: 'Stäng', closeStatus: '',
		yearStatus: '', monthStatus: '',
		weekText: 'Ve', weekStatus: '',
		dayStatus: 'DD, M d', defaultStatus: '',
		isRTL: false
	};
	$.calendars.picker.setDefaults($.calendars.picker.regional['sv']);
})(jQuery);

/* http://keith-wood.name/calendars.html
   Simplified Chinese localisation for calendars datepicker for jQuery.
   Written by Cloudream (cloudream@gmail.com). */
(function($) {
	$.calendars.picker.regional['zh-CN'] = {
		renderer: $.extend({}, $.calendars.picker.defaultRenderer,
			{month: $.calendars.picker.defaultRenderer.month.
				replace(/monthHeader/, 'monthHeader:MM yyyy年')}),
		prevText: '&#x3c;上月', prevStatus: '显示上月',
		prevJumpText: '&#x3c;&#x3c;', prevJumpStatus: '显示上一年',
		nextText: '下月&#x3e;', nextStatus: '显示下月',
		nextJumpText: '&#x3e;&#x3e;', nextJumpStatus: '显示下一年',
		currentText: '今天', currentStatus: '显示本月',
		todayText: '今天', todayStatus: '显示本月',
		clearText: '清除', clearStatus: '清除已选日期',
		closeText: '关闭', closeStatus: '不改变当前选择',
		yearStatus: '选择年份', monthStatus: '选择月份',
		weekText: '周', weekStatus: '年内周次',
		dayStatus: '选择 m月 d日, DD', defaultStatus: '请选择日期',
		isRTL: false
	};
	$.calendars.picker.setDefaults($.calendars.picker.regional['zh-CN']);
})(jQuery);

/* http://keith-wood.name/calendars.html
   Calendars extras for jQuery v1.2.1.
   Written by Keith Wood (kbwood{at}iinet.com.au) August 2009.
   Available under the MIT (https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt) license. 
   Please attribute the author if you use it. */

(function($) { // Hide scope, no $ conflict

$.extend($.calendars.regional[''], {
	invalidArguments: 'Invalid arguments',
	invalidFormat: 'Cannot format a date from another calendar',
	missingNumberAt: 'Missing number at position {0}',
	unknownNameAt: 'Unknown name at position {0}',
	unexpectedLiteralAt: 'Unexpected literal at position {0}',
	unexpectedText: 'Additional text found at end'
});
$.calendars.local = $.calendars.regional[''];

$.extend($.calendars.cdate.prototype, {

	/* Format this date.
	   @param  format  (string) the date format to use (see BaseCalendar.formatDate) (optional)
	   @return  (string) the formatted date */
	formatDate: function(format) {
		return this._calendar.formatDate(format || '', this);
	}
});

$.extend($.calendars.baseCalendar.prototype, {

	UNIX_EPOCH: $.calendars.instance().newDate(1970, 1, 1).toJD(),
	SECS_PER_DAY: 24 * 60 * 60,
	TICKS_EPOCH: $.calendars.instance().jdEpoch, // 1 January 0001 CE
	TICKS_PER_DAY: 24 * 60 * 60 * 10000000,

	ATOM: 'yyyy-mm-dd', // RFC 3339/ISO 8601
	COOKIE: 'D, dd M yyyy',
	FULL: 'DD, MM d, yyyy',
	ISO_8601: 'yyyy-mm-dd',
	JULIAN: 'J',
	RFC_822: 'D, d M yy',
	RFC_850: 'DD, dd-M-yy',
	RFC_1036: 'D, d M yy',
	RFC_1123: 'D, d M yyyy',
	RFC_2822: 'D, d M yyyy',
	RSS: 'D, d M yy', // RFC 822
	TICKS: '!',
	TIMESTAMP: '@',
	W3C: 'yyyy-mm-dd', // ISO 8601

	/* Format a date object into a string value.
	   The format can be combinations of the following:
	   d  - day of month (no leading zero)
	   dd - day of month (two digit)
	   o  - day of year (no leading zeros)
	   oo - day of year (three digit)
	   D  - day name short
	   DD - day name long
	   w  - week of year (no leading zero)
	   ww - week of year (two digit)
	   m  - month of year (no leading zero)
	   mm - month of year (two digit)
	   M  - month name short
	   MM - month name long
	   yy - year (two digit)
	   yyyy - year (four digit)
	   YYYY - formatted year
	   J  - Julian date (days since January 1, 4713 BCE Greenwich noon)
	   @  - Unix timestamp (s since 01/01/1970)
	   !  - Windows ticks (100ns since 01/01/0001)
	   '...' - literal text
	   '' - single quote
	   @param  format    (string) the desired format of the date (optional, default calendar format)
	   @param  date      (CDate) the date value to format
	   @param  settings  (object) attributes include:
	                     dayNamesShort    (string[]) abbreviated names of the days from Sunday (optional)
	                     dayNames         (string[]) names of the days from Sunday (optional)
	                     monthNamesShort  (string[]) abbreviated names of the months (optional)
	                     monthNames       (string[]) names of the months (optional)
						 calculateWeek    (function) function that determines week of the year (optional)
	   @return  (string) the date in the above format
	   @throws  errors if the date is from a different calendar */
	formatDate: function(format, date, settings) {
		if (typeof format != 'string') {
			settings = date;
			date = format;
			format = '';
		}
		if (!date) {
			return '';
		}
		if (date.calendar() != this) {
			throw $.calendars.local.invalidFormat || $.calendars.regional[''].invalidFormat;
		}
		format = format || this.local.dateFormat;
		settings = settings || {};
		var dayNamesShort = settings.dayNamesShort || this.local.dayNamesShort;
		var dayNames = settings.dayNames || this.local.dayNames;
		var monthNamesShort = settings.monthNamesShort || this.local.monthNamesShort;
		var monthNames = settings.monthNames || this.local.monthNames;
		var calculateWeek = settings.calculateWeek || this.local.calculateWeek;
		// Check whether a format character is doubled
		var doubled = function(match, step) {
			var matches = 1;
			while (iFormat + matches < format.length && format.charAt(iFormat + matches) == match) {
				matches++;
			}
			iFormat += matches - 1;
			return Math.floor(matches / (step || 1)) > 1;
		};
		// Format a number, with leading zeroes if necessary
		var formatNumber = function(match, value, len, step) {
			var num = '' + value;
			if (doubled(match, step)) {
				while (num.length < len) {
					num = '0' + num;
				}
			}
			return num;
		};
		// Format a name, short or long as requested
		var formatName = function(match, value, shortNames, longNames) {
			return (doubled(match) ? longNames[value] : shortNames[value]);
		};
		var output = '';
		var literal = false;
		for (var iFormat = 0; iFormat < format.length; iFormat++) {
			if (literal) {
				if (format.charAt(iFormat) == "'" && !doubled("'")) {
					literal = false;
				}
				else {
					output += format.charAt(iFormat);
				}
			}
			else {
				switch (format.charAt(iFormat)) {
					case 'd': output += formatNumber('d', date.day(), 2); break;
					case 'D': output += formatName('D', date.dayOfWeek(),
						dayNamesShort, dayNames); break;
					case 'o': output += formatNumber('o', date.dayOfYear(), 3); break;
					case 'w': output += formatNumber('w', date.weekOfYear(), 2); break;
					case 'm': output += formatNumber('m', date.month(), 2); break;
					case 'M': output += formatName('M', date.month() - this.minMonth,
						monthNamesShort, monthNames); break;
					case 'y':
						output += (doubled('y', 2) ? date.year() :
							(date.year() % 100 < 10 ? '0' : '') + date.year() % 100);
						break;
					case 'Y':
						doubled('Y', 2);
						output += date.formatYear();
						break;
					case 'J': output += date.toJD(); break;
					case '@': output += (date.toJD() - this.UNIX_EPOCH) * this.SECS_PER_DAY; break;
					case '!': output += (date.toJD() - this.TICKS_EPOCH) * this.TICKS_PER_DAY; break;
					case "'":
						if (doubled("'")) {
							output += "'";
						}
						else {
							literal = true;
						}
						break;
					default:
						output += format.charAt(iFormat);
				}
			}
		}
		return output;
	},

	/* Parse a string value into a date object.
	   See formatDate for the possible formats, plus:
	   * - ignore rest of string
	   @param  format    (string) the expected format of the date ('' for default calendar format)
	   @param  value     (string) the date in the above format
	   @param  settings  (object) attributes include:
	                     shortYearCutoff  (number) the cutoff year for determining the century (optional)
	                     dayNamesShort    (string[]) abbreviated names of the days from Sunday (optional)
	                     dayNames         (string[]) names of the days from Sunday (optional)
	                     monthNamesShort  (string[]) abbreviated names of the months (optional)
	                     monthNames       (string[]) names of the months (optional)
	   @return  (CDate) the extracted date value or null if value is blank
	   @throws  errors if the format and/or value are missing,
	            if the value doesn't match the format,
	            or if the date is invalid */
	parseDate: function(format, value, settings) {
		if (value == null) {
			throw $.calendars.local.invalidArguments || $.calendars.regional[''].invalidArguments;
		}
		value = (typeof value == 'object' ? value.toString() : value + '');
		if (value == '') {
			return null;
		}
		format = format || this.local.dateFormat;
		settings = settings || {};
		var shortYearCutoff = settings.shortYearCutoff || this.shortYearCutoff;
		shortYearCutoff = (typeof shortYearCutoff != 'string' ? shortYearCutoff :
			this.today().year() % 100 + parseInt(shortYearCutoff, 10));
		var dayNamesShort = settings.dayNamesShort || this.local.dayNamesShort;
		var dayNames = settings.dayNames || this.local.dayNames;
		var monthNamesShort = settings.monthNamesShort || this.local.monthNamesShort;
		var monthNames = settings.monthNames || this.local.monthNames;
		var jd = -1;
		var year = -1;
		var month = -1;
		var day = -1;
		var doy = -1;
		var shortYear = false;
		var literal = false;
		// Check whether a format character is doubled
		var doubled = function(match, step) {
			var matches = 1;
			while (iFormat + matches < format.length && format.charAt(iFormat + matches) == match) {
				matches++;
			}
			iFormat += matches - 1;
			return Math.floor(matches / (step || 1)) > 1;
		};
		// Extract a number from the string value
		var getNumber = function(match, step) {
			var isDoubled = doubled(match, step);
			var size = [2, 3, isDoubled ? 4 : 2, isDoubled ? 4 : 2, 10, 11, 20]['oyYJ@!'.indexOf(match) + 1];
			var digits = new RegExp('^-?\\d{1,' + size + '}');
			var num = value.substring(iValue).match(digits);
			if (!num) {
				throw ($.calendars.local.missingNumberAt || $.calendars.regional[''].missingNumberAt).
					replace(/\{0\}/, iValue);
			}
			iValue += num[0].length;
			return parseInt(num[0], 10);
		};
		// Extract a name from the string value and convert to an index
		var calendar = this;
		var getName = function(match, shortNames, longNames, step) {
			var names = (doubled(match, step) ? longNames : shortNames);
			for (var i = 0; i < names.length; i++) {
				if (value.substr(iValue, names[i].length).toLowerCase() == names[i].toLowerCase()) {
					iValue += names[i].length;
					return i + calendar.minMonth;
				}
			}
			throw ($.calendars.local.unknownNameAt || $.calendars.regional[''].unknownNameAt).
				replace(/\{0\}/, iValue);
		};
		// Confirm that a literal character matches the string value
		var checkLiteral = function() {
			if (value.charAt(iValue) != format.charAt(iFormat)) {
				throw ($.calendars.local.unexpectedLiteralAt ||
					$.calendars.regional[''].unexpectedLiteralAt).replace(/\{0\}/, iValue);
			}
			iValue++;
		};
		var iValue = 0;
		for (var iFormat = 0; iFormat < format.length; iFormat++) {
			if (literal) {
				if (format.charAt(iFormat) == "'" && !doubled("'")) {
					literal = false;
				}
				else {
					checkLiteral();
				}
			}
			else {
				switch (format.charAt(iFormat)) {
					case 'd': day = getNumber('d'); break;
					case 'D': getName('D', dayNamesShort, dayNames); break;
					case 'o': doy = getNumber('o'); break;
					case 'w': getNumber('w'); break;
					case 'm': month = getNumber('m'); break;
					case 'M': month = getName('M', monthNamesShort, monthNames); break;
					case 'y':
						var iSave = iFormat;
						shortYear = !doubled('y', 2);
						iFormat = iSave;
						year = getNumber('y', 2);
						break;
					case 'Y': year = getNumber('Y', 2); break;
					case 'J':
						jd = getNumber('J') + 0.5;
						if (value.charAt(iValue) == '.') {
							iValue++;
							getNumber('J');
						}
						break;
					case '@': jd = getNumber('@') / this.SECS_PER_DAY + this.UNIX_EPOCH; break;
					case '!': jd = getNumber('!') / this.TICKS_PER_DAY + this.TICKS_EPOCH; break;
					case '*': iValue = value.length; break;
					case "'":
						if (doubled("'")) {
							checkLiteral();
						}
						else {
							literal = true;
						}
						break;
					default: checkLiteral();
				}
			}
		}
		if (iValue < value.length) {
            // Ignore : don't stop setting of calendar picker date if dateemtry value contains time part
			//throw $.calendars.local.unexpectedText || $.calendars.regional[''].unexpectedText;
		}
		if (year == -1) {
			year = this.today().year();
		}
		else if (year < 100 && shortYear) {
			year += (shortYearCutoff == -1 ? 1900 : this.today().year() -
				this.today().year() % 100 - (year <= shortYearCutoff ? 0 : 100));
		}
		if (doy > -1) {
			month = 1;
			day = doy;
			for (var dim = this.daysInMonth(year, month); day > dim; dim = this.daysInMonth(year, month)) {
				month++;
				day -= dim;
			}
		}
		return (jd > -1 ? this.fromJD(jd) : this.newDate(year, month, day));
	},

	/* A date may be specified as an exact value or a relative one.
	   @param  dateSpec     (CDate or number or string) the date as an object or string
	                        in the given format or an offset - numeric days from today,
	                        or string amounts and periods, e.g. '+1m +2w'
	   @param  defaultDate  (CDate) the date to use if no other supplied, may be null
	   @param  currentDate  (CDate) the current date as a possible basis for relative dates,
	                        if null today is used (optional)
	   @param  dateFormat   (string) the expected date format - see formatDate above (optional)
	   @param  settings     (object) attributes include:
	                        shortYearCutoff  (number) the cutoff year for determining the century (optional)
	                        dayNamesShort    (string[7]) abbreviated names of the days from Sunday (optional)
	                        dayNames         (string[7]) names of the days from Sunday (optional)
	                        monthNamesShort  (string[12]) abbreviated names of the months (optional)
	                        monthNames       (string[12]) names of the months (optional)
	   @return  (CDate) the decoded date */
	determineDate: function(dateSpec, defaultDate, currentDate, dateFormat, settings) {
		if (currentDate && typeof currentDate != 'object') {
			settings = dateFormat;
			dateFormat = currentDate;
			currentDate = null;
		}
		if (typeof dateFormat != 'string') {
			settings = dateFormat;
			dateFormat = '';
		}
		var calendar = this;
		var offsetString = function(offset) {
			try {
				return calendar.parseDate(dateFormat, offset, settings);
			}
			catch (e) {
				// Ignore
			}
			offset = offset.toLowerCase();
			var date = (offset.match(/^c/) && currentDate ?
				currentDate.newDate() : null) || calendar.today();
			var pattern = /([+-]?[0-9]+)\s*(d|w|m|y)?/g;
			var matches = pattern.exec(offset);
			while (matches) {
				date.add(parseInt(matches[1], 10), matches[2] || 'd');
				matches = pattern.exec(offset);
			}
			return date;
		};
		defaultDate = (defaultDate ? defaultDate.newDate() : null);
		dateSpec = (dateSpec == null ? defaultDate :
			(typeof dateSpec == 'string' ? offsetString(dateSpec) : (typeof dateSpec == 'number' ?
			(isNaN(dateSpec) || dateSpec == Infinity || dateSpec == -Infinity ? defaultDate :
			calendar.today().add(dateSpec, 'd')) : calendar.newDate(dateSpec))));
		return dateSpec;
	}
});

})(jQuery);

/* http://keith-wood.name/calendars.html
   UmmAlQura calendar for jQuery v1.2.1.
   Written by Amro Osama March 2013.
   Available under the MIT (https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt) license. 
   Please attribute the author if you use it. */

(function ($) { // Hide scope, no $ conflict

/* Implementation of the UmmAlQura or 'saudi' calendar.
   See also http://en.wikipedia.org/wiki/Islamic_calendar#Saudi_Arabia.27s_Umm_al-Qura_calendar.
   http://www.ummulqura.org.sa/About.aspx
   http://www.staff.science.uu.nl/~gent0113/islam/ummalqura.htm
   @param  language  (string) the language code (default English) for localisation (optional) */
function UmmAlQuraCalendar(language) {
	this.local = this.regional[language || ''] || this.regional[''];
}

UmmAlQuraCalendar.prototype = new $.calendars.baseCalendar;

$.extend(UmmAlQuraCalendar.prototype, {
	name: 'UmmAlQura', // The calendar name
	//jdEpoch: 1948440, // Julian date of start of UmmAlQura epoch: 14 March 1937 CE
	//daysPerMonth: // Days per month in a common year, replaced by a method.
	hasYearZero: false, // True if has a year zero, false if not
	minMonth: 1, // The minimum month number
	firstMonth: 1, // The first month in the year
	minDay: 1, // The minimum day number

	regional: { // Localisations
		'': {
			name: 'Umm al-Qura', // The calendar name
			epochs: ['BH', 'AH'],
			monthNames: ['Al-Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' Al-Thani', 'Jumada Al-Awwal', 'Jumada Al-Thani',
			'Rajab', 'Sha\'aban', 'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'],
			monthNamesShort: ['Muh', 'Saf', 'Rab1', 'Rab2', 'Jum1', 'Jum2', 'Raj', 'Sha\'', 'Ram', 'Shaw', 'DhuQ', 'DhuH'],
			dayNames: ['Yawm al-Ahad', 'Yawm al-Ithnain', 'Yawm al-Thalāthā’', 'Yawm al-Arba‘ā’', 'Yawm al-Khamīs', 'Yawm al-Jum‘a', 'Yawm al-Sabt'],
			dayNamesMin: ['Ah', 'Ith', 'Th', 'Ar', 'Kh', 'Ju', 'Sa'],
			dateFormat: 'yyyy/mm/dd', // See format options on BaseCalendar.formatDate
			firstDay: 6, // The first day of the week, Sat = 0, Sun = 1, ...
			isRTL: true // True if right-to-left language, false if left-to-right
		}
	},

	/* Determine whether this date is in a leap year.
	   @param  year  (CDate) the date to examine or
	                 (number) the year to examine
	   @return  (boolean) true if this is a leap year, false if not
	   @throws  error if an invalid year or a different calendar used */
	leapYear: function (year) {
		var date = this._validate(year, this.minMonth, this.minDay, $.calendars.local.invalidYear);
		return (this.daysInYear(date.year()) == 355);
	},

	/* Determine the week of the year for a date.
	   @param  year   (CDate) the date to examine or
	                  (number) the year to examine
	   @param  month  (number) the month to examine
	   @param  day    (number) the day to examine
	   @return  (number) the week of the year
	   @throws  error if an invalid date or a different calendar used */
	weekOfYear: function (year, month, day) {
		// Find Sunday of this week starting on Sunday
		var checkDate = this.newDate(year, month, day);
		checkDate.add(-checkDate.dayOfWeek(), 'd');
		return Math.floor((checkDate.dayOfYear() - 1) / 7) + 1;
	},

	/* Retrieve the number of days in a year.
	   @param  year   (CDate) the date to examine or
	                  (number) the year to examine
	   @return  (number) the number of days
	   @throws  error if an invalid year or a different calendar used */
	daysInYear: function (year) {
		var daysCount = 0;
		for (var i = 1; i <= 12; i++) {
			daysCount += this.daysInMonth(year, i);
		}
		return daysCount;
	},

	/* Retrieve the number of days in a month.
	   @param  year   (CDate) the date to examine or
	                  (number) the year of the month
	   @param  month  (number) the month
	   @return  (number) the number of days in this month
	   @throws  error if an invalid month/year or a different calendar used */
	daysInMonth: function (year, month) {
		var date = this._validate(year, month, this.minDay, $.calendars.local.invalidMonth);
		var mcjdn = date.toJD() - 2400000 + 0.5; // Modified Chronological Julian Day Number (MCJDN)
		// the MCJDN's of the start of the lunations in the Umm al-Qura calendar are stored in the 'ummalqura_dat' array
		var index = 0;
		for (var i = 0; i < ummalqura_dat.length; i++) {
			if (ummalqura_dat[i] > mcjdn) {
				return (ummalqura_dat[index] - ummalqura_dat[index - 1]);
			}
			index++;
		}
		return 30; // Unknown outside
	},

	/* Determine whether this date is a week day.
	   @param  year   (CDate) the date to examine or
	                  (number) the year to examine
	   @param  month  (number) the month to examine
	   @param  day    (number) the day to examine
	   @return  (boolean) true if a week day, false if not
	   @throws  error if an invalid date or a different calendar used */
	weekDay: function (year, month, day) {
		return this.dayOfWeek(year, month, day) != 5;
	},

	/* Retrieve the Julian date equivalent for this date,
	   i.e. days since January 1, 4713 BCE Greenwich noon.
	   @param  year   (CDate) the date to convert or
	                  (number) the year to convert
	   @param  month  (number) the month to convert
	   @param  day    (number) the day to convert
	   @return  (number) the equivalent Julian date
	   @throws  error if an invalid date or a different calendar used */
	toJD: function (year, month, day) {
		var date = this._validate(year, month, day, $.calendars.local.invalidDate);
		var index = (12 * (date.year() - 1)) + date.month() - 16260;
		var mcjdn = date.day() + ummalqura_dat[index - 1] - 1;
		return mcjdn + 2400000 - 0.5; // Modified Chronological Julian Day Number (MCJDN)
	},

	/* Create a new date from a Julian date.
	   @param  jd  (number) the Julian date to convert
	   @return  (CDate) the equivalent date */
	fromJD: function (jd) {
		var mcjdn = jd - 2400000 + 0.5; // Modified Chronological Julian Day Number (MCJDN)
		// the MCJDN's of the start of the lunations in the Umm al-Qura calendar 
		// are stored in the 'ummalqura_dat' array
		var index = 0;
		for (var i = 0; i < ummalqura_dat.length; i++) {
			if (ummalqura_dat[i] > mcjdn) break;
			index++;
		}
		var lunation = index + 16260; //UmmAlQura Lunation Number
		var ii = Math.floor((lunation - 1) / 12);
		var year = ii + 1;
		var month = lunation - 12 * ii;
		var day = mcjdn - ummalqura_dat[index - 1] + 1;
		return this.newDate(year, month, day);
	},

	/* Determine whether a date is valid for this calendar.
	   @param  year   (number) the year to examine
	   @param  month  (number) the month to examine
	   @param  day    (number) the day to examine
	   @return  (boolean) true if a valid date, false if not */
	isValid: function(year, month, day) {
		var valid = $.calendars.baseCalendar.prototype.isValid.apply(this, arguments);
		if (valid) {
			year = (year.year != null ? year.year : year);
			valid = (year >= 1356 && year <= 1500);
		}
		return valid;
	},

	/* Check that a candidate date is from the same calendar and is valid.
	   @param  year   (CDate) the date to validate or
	                  (number) the year to validate
	   @param  month  (number) the month to validate
	   @param  day    (number) the day to validate
	   @param  error  (string) error message if invalid
	   @throws  error if different calendars used or invalid date */
	_validate: function(year, month, day, error) {
		var date = $.calendars.baseCalendar.prototype._validate.apply(this, arguments);
		if (date.year < 1356 || date.year > 1500) {
			throw error.replace(/\{0\}/, this.local.name);
		}
		return date;
	}
});

// UmmAlQura calendar implementation
$.calendars.calendars.ummalqura = UmmAlQuraCalendar;

var ummalqura_dat = [
	28607, 28636, 28665, 28695, 28724, 28754, 28783, 28813, 28843, 28872, 28901, 28931, 28960, 28990, 29019, 29049, 29078, 29108, 29137, 29167,
	29196, 29226, 29255, 29285, 29315, 29345, 29375, 29404, 29434, 29463, 29492, 29522, 29551, 29580, 29610, 29640, 29669, 29699, 29729, 29759,
	29788, 29818, 29847, 29876, 29906, 29935, 29964, 29994, 30023, 30053, 30082, 30112, 30141, 30171, 30200, 30230, 30259, 30289, 30318, 30348,
	30378, 30408, 30437, 30467, 30496, 30526, 30555, 30585, 30614, 30644, 30673, 30703, 30732, 30762, 30791, 30821, 30850, 30880, 30909, 30939,
	30968, 30998, 31027, 31057, 31086, 31116, 31145, 31175, 31204, 31234, 31263, 31293, 31322, 31352, 31381, 31411, 31441, 31471, 31500, 31530,
	31559, 31589, 31618, 31648, 31676, 31706, 31736, 31766, 31795, 31825, 31854, 31884, 31913, 31943, 31972, 32002, 32031, 32061, 32090, 32120,
	32150, 32180, 32209, 32239, 32268, 32298, 32327, 32357, 32386, 32416, 32445, 32475, 32504, 32534, 32563, 32593, 32622, 32652, 32681, 32711,
	32740, 32770, 32799, 32829, 32858, 32888, 32917, 32947, 32976, 33006, 33035, 33065, 33094, 33124, 33153, 33183, 33213, 33243, 33272, 33302,
	33331, 33361, 33390, 33420, 33450, 33479, 33509, 33539, 33568, 33598, 33627, 33657, 33686, 33716, 33745, 33775, 33804, 33834, 33863, 33893,
	33922, 33952, 33981, 34011, 34040, 34069, 34099, 34128, 34158, 34187, 34217, 34247, 34277, 34306, 34336, 34365, 34395, 34424, 34454, 34483,
	34512, 34542, 34571, 34601, 34631, 34660, 34690, 34719, 34749, 34778, 34808, 34837, 34867, 34896, 34926, 34955, 34985, 35015, 35044, 35074,
	35103, 35133, 35162, 35192, 35222, 35251, 35280, 35310, 35340, 35370, 35399, 35429, 35458, 35488, 35517, 35547, 35576, 35605, 35635, 35665,
	35694, 35723, 35753, 35782, 35811, 35841, 35871, 35901, 35930, 35960, 35989, 36019, 36048, 36078, 36107, 36136, 36166, 36195, 36225, 36254,
	36284, 36314, 36343, 36373, 36403, 36433, 36462, 36492, 36521, 36551, 36580, 36610, 36639, 36669, 36698, 36728, 36757, 36786, 36816, 36845,
	36875, 36904, 36934, 36963, 36993, 37022, 37052, 37081, 37111, 37141, 37170, 37200, 37229, 37259, 37288, 37318, 37347, 37377, 37406, 37436,
	37465, 37495, 37524, 37554, 37584, 37613, 37643, 37672, 37701, 37731, 37760, 37790, 37819, 37849, 37878, 37908, 37938, 37967, 37997, 38027,
	38056, 38085, 38115, 38144, 38174, 38203, 38233, 38262, 38292, 38322, 38351, 38381, 38410, 38440, 38469, 38499, 38528, 38558, 38587, 38617,
	38646, 38676, 38705, 38735, 38764, 38794, 38823, 38853, 38882, 38912, 38941, 38971, 39001, 39030, 39059, 39089, 39118, 39148, 39178, 39208,
	39237, 39267, 39297, 39326, 39355, 39385, 39414, 39444, 39473, 39503, 39532, 39562, 39592, 39621, 39650, 39680, 39709, 39739, 39768, 39798,
	39827, 39857, 39886, 39916, 39946, 39975, 40005, 40035, 40064, 40094, 40123, 40153, 40182, 40212, 40241, 40271, 40300, 40330, 40359, 40389,
	40418, 40448, 40477, 40507, 40536, 40566, 40595, 40625, 40655, 40685, 40714, 40744, 40773, 40803, 40832, 40862, 40892, 40921, 40951, 40980,
	41009, 41039, 41068, 41098, 41127, 41157, 41186, 41216, 41245, 41275, 41304, 41334, 41364, 41393, 41422, 41452, 41481, 41511, 41540, 41570,
	41599, 41629, 41658, 41688, 41718, 41748, 41777, 41807, 41836, 41865, 41894, 41924, 41953, 41983, 42012, 42042, 42072, 42102, 42131, 42161,
	42190, 42220, 42249, 42279, 42308, 42337, 42367, 42397, 42426, 42456, 42485, 42515, 42545, 42574, 42604, 42633, 42662, 42692, 42721, 42751,
	42780, 42810, 42839, 42869, 42899, 42929, 42958, 42988, 43017, 43046, 43076, 43105, 43135, 43164, 43194, 43223, 43253, 43283, 43312, 43342,
	43371, 43401, 43430, 43460, 43489, 43519, 43548, 43578, 43607, 43637, 43666, 43696, 43726, 43755, 43785, 43814, 43844, 43873, 43903, 43932,
	43962, 43991, 44021, 44050, 44080, 44109, 44139, 44169, 44198, 44228, 44258, 44287, 44317, 44346, 44375, 44405, 44434, 44464, 44493, 44523,
	44553, 44582, 44612, 44641, 44671, 44700, 44730, 44759, 44788, 44818, 44847, 44877, 44906, 44936, 44966, 44996, 45025, 45055, 45084, 45114,
	45143, 45172, 45202, 45231, 45261, 45290, 45320, 45350, 45380, 45409, 45439, 45468, 45498, 45527, 45556, 45586, 45615, 45644, 45674, 45704,
	45733, 45763, 45793, 45823, 45852, 45882, 45911, 45940, 45970, 45999, 46028, 46058, 46088, 46117, 46147, 46177, 46206, 46236, 46265, 46295,
	46324, 46354, 46383, 46413, 46442, 46472, 46501, 46531, 46560, 46590, 46620, 46649, 46679, 46708, 46738, 46767, 46797, 46826, 46856, 46885,
	46915, 46944, 46974, 47003, 47033, 47063, 47092, 47122, 47151, 47181, 47210, 47240, 47269, 47298, 47328, 47357, 47387, 47417, 47446, 47476,
	47506, 47535, 47565, 47594, 47624, 47653, 47682, 47712, 47741, 47771, 47800, 47830, 47860, 47890, 47919, 47949, 47978, 48008, 48037, 48066,
	48096, 48125, 48155, 48184, 48214, 48244, 48273, 48303, 48333, 48362, 48392, 48421, 48450, 48480, 48509, 48538, 48568, 48598, 48627, 48657,
	48687, 48717, 48746, 48776, 48805, 48834, 48864, 48893, 48922, 48952, 48982, 49011, 49041, 49071, 49100, 49130, 49160, 49189, 49218, 49248,
	49277, 49306, 49336, 49365, 49395, 49425, 49455, 49484, 49514, 49543, 49573, 49602, 49632, 49661, 49690, 49720, 49749, 49779, 49809, 49838,
	49868, 49898, 49927, 49957, 49986, 50016, 50045, 50075, 50104, 50133, 50163, 50192, 50222, 50252, 50281, 50311, 50340, 50370, 50400, 50429,
	50459, 50488, 50518, 50547, 50576, 50606, 50635, 50665, 50694, 50724, 50754, 50784, 50813, 50843, 50872, 50902, 50931, 50960, 50990, 51019,
	51049, 51078, 51108, 51138, 51167, 51197, 51227, 51256, 51286, 51315, 51345, 51374, 51403, 51433, 51462, 51492, 51522, 51552, 51582, 51611,
	51641, 51670, 51699, 51729, 51758, 51787, 51816, 51846, 51876, 51906, 51936, 51965, 51995, 52025, 52054, 52083, 52113, 52142, 52171, 52200,
	52230, 52260, 52290, 52319, 52349, 52379, 52408, 52438, 52467, 52497, 52526, 52555, 52585, 52614, 52644, 52673, 52703, 52733, 52762, 52792,
	52822, 52851, 52881, 52910, 52939, 52969, 52998, 53028, 53057, 53087, 53116, 53146, 53176, 53205, 53235, 53264, 53294, 53324, 53353, 53383,
	53412, 53441, 53471, 53500, 53530, 53559, 53589, 53619, 53648, 53678, 53708, 53737, 53767, 53796, 53825, 53855, 53884, 53913, 53943, 53973,
	54003, 54032, 54062, 54092, 54121, 54151, 54180, 54209, 54239, 54268, 54297, 54327, 54357, 54387, 54416, 54446, 54476, 54505, 54535, 54564,
	54593, 54623, 54652, 54681, 54711, 54741, 54770, 54800, 54830, 54859, 54889, 54919, 54948, 54977, 55007, 55036, 55066, 55095, 55125, 55154,
	55184, 55213, 55243, 55273, 55302, 55332, 55361, 55391, 55420, 55450, 55479, 55508, 55538, 55567, 55597, 55627, 55657, 55686, 55716, 55745,
	55775, 55804, 55834, 55863, 55892, 55922, 55951, 55981, 56011, 56040, 56070, 56100, 56129, 56159, 56188, 56218, 56247, 56276, 56306, 56335,
	56365, 56394, 56424, 56454, 56483, 56513, 56543, 56572, 56601, 56631, 56660, 56690, 56719, 56749, 56778, 56808, 56837, 56867, 56897, 56926,
	56956, 56985, 57015, 57044, 57074, 57103, 57133, 57162, 57192, 57221, 57251, 57280, 57310, 57340, 57369, 57399, 57429, 57458, 57487, 57517,
	57546, 57576, 57605, 57634, 57664, 57694, 57723, 57753, 57783, 57813, 57842, 57871, 57901, 57930, 57959, 57989, 58018, 58048, 58077, 58107,
	58137, 58167, 58196, 58226, 58255, 58285, 58314, 58343, 58373, 58402, 58432, 58461, 58491, 58521, 58551, 58580, 58610, 58639, 58669, 58698,
	58727, 58757, 58786, 58816, 58845, 58875, 58905, 58934, 58964, 58994, 59023, 59053, 59082, 59111, 59141, 59170, 59200, 59229, 59259, 59288,
	59318, 59348, 59377, 59407, 59436, 59466, 59495, 59525, 59554, 59584, 59613, 59643, 59672, 59702, 59731, 59761, 59791, 59820, 59850, 59879,
	59909, 59939, 59968, 59997, 60027, 60056, 60086, 60115, 60145, 60174, 60204, 60234, 60264, 60293, 60323, 60352, 60381, 60411, 60440, 60469,
	60499, 60528, 60558, 60588, 60618, 60648, 60677, 60707, 60736, 60765, 60795, 60824, 60853, 60883, 60912, 60942, 60972, 61002, 61031, 61061,
	61090, 61120, 61149, 61179, 61208, 61237, 61267, 61296, 61326, 61356, 61385, 61415, 61445, 61474, 61504, 61533, 61563, 61592, 61621, 61651,
	61680, 61710, 61739, 61769, 61799, 61828, 61858, 61888, 61917, 61947, 61976, 62006, 62035, 62064, 62094, 62123, 62153, 62182, 62212, 62242,
	62271, 62301, 62331, 62360, 62390, 62419, 62448, 62478, 62507, 62537, 62566, 62596, 62625, 62655, 62685, 62715, 62744, 62774, 62803, 62832,
	62862, 62891, 62921, 62950, 62980, 63009, 63039, 63069, 63099, 63128, 63157, 63187, 63216, 63246, 63275, 63305, 63334, 63363, 63393, 63423,
	63453, 63482, 63512, 63541, 63571, 63600, 63630, 63659, 63689, 63718, 63747, 63777, 63807, 63836, 63866, 63895, 63925, 63955, 63984, 64014,
	64043, 64073, 64102, 64131, 64161, 64190, 64220, 64249, 64279, 64309, 64339, 64368, 64398, 64427, 64457, 64486, 64515, 64545, 64574, 64603,
	64633, 64663, 64692, 64722, 64752, 64782, 64811, 64841, 64870, 64899, 64929, 64958, 64987, 65017, 65047, 65076, 65106, 65136, 65166, 65195,
	65225, 65254, 65283, 65313, 65342, 65371, 65401, 65431, 65460, 65490, 65520, 65549, 65579, 65608, 65638, 65667, 65697, 65726, 65755, 65785,
	65815, 65844, 65874, 65903, 65933, 65963, 65992, 66022, 66051, 66081, 66110, 66140, 66169, 66199, 66228, 66258, 66287, 66317, 66346, 66376,
	66405, 66435, 66465, 66494, 66524, 66553, 66583, 66612, 66641, 66671, 66700, 66730, 66760, 66789, 66819, 66849, 66878, 66908, 66937, 66967,
	66996, 67025, 67055, 67084, 67114, 67143, 67173, 67203, 67233, 67262, 67292, 67321, 67351, 67380, 67409, 67439, 67468, 67497, 67527, 67557,
	67587, 67617, 67646, 67676, 67705, 67735, 67764, 67793, 67823, 67852, 67882, 67911, 67941, 67971, 68000, 68030, 68060, 68089, 68119, 68148,
	68177, 68207, 68236, 68266, 68295, 68325, 68354, 68384, 68414, 68443, 68473, 68502, 68532, 68561, 68591, 68620, 68650, 68679, 68708, 68738,
	68768, 68797, 68827, 68857, 68886, 68916, 68946, 68975, 69004, 69034, 69063, 69092, 69122, 69152, 69181, 69211, 69240, 69270, 69300, 69330,
	69359, 69388, 69418, 69447, 69476, 69506, 69535, 69565, 69595, 69624, 69654, 69684, 69713, 69743, 69772, 69802, 69831, 69861, 69890, 69919,
	69949, 69978, 70008, 70038, 70067, 70097, 70126, 70156, 70186, 70215, 70245, 70274, 70303, 70333, 70362, 70392, 70421, 70451, 70481, 70510,
	70540, 70570, 70599, 70629, 70658, 70687, 70717, 70746, 70776, 70805, 70835, 70864, 70894, 70924, 70954, 70983, 71013, 71042, 71071, 71101,
	71130, 71159, 71189, 71218, 71248, 71278, 71308, 71337, 71367, 71397, 71426, 71455, 71485, 71514, 71543, 71573, 71602, 71632, 71662, 71691,
	71721, 71751, 71781, 71810, 71839, 71869, 71898, 71927, 71957, 71986, 72016, 72046, 72075, 72105, 72135, 72164, 72194, 72223, 72253, 72282,
	72311, 72341, 72370, 72400, 72429, 72459, 72489, 72518, 72548, 72577, 72607, 72637, 72666, 72695, 72725, 72754, 72784, 72813, 72843, 72872,
	72902, 72931, 72961, 72991, 73020, 73050, 73080, 73109, 73139, 73168, 73197, 73227, 73256, 73286, 73315, 73345, 73375, 73404, 73434, 73464,
	73493, 73523, 73552, 73581, 73611, 73640, 73669, 73699, 73729, 73758, 73788, 73818, 73848, 73877, 73907, 73936, 73965, 73995, 74024, 74053,
	74083, 74113, 74142, 74172, 74202, 74231, 74261, 74291, 74320, 74349, 74379, 74408, 74437, 74467, 74497, 74526, 74556, 74586, 74615, 74645,
	74675, 74704, 74733, 74763, 74792, 74822, 74851, 74881, 74910, 74940, 74969, 74999, 75029, 75058, 75088, 75117, 75147, 75176, 75206, 75235,
	75264, 75294, 75323, 75353, 75383, 75412, 75442, 75472, 75501, 75531, 75560, 75590, 75619, 75648, 75678, 75707, 75737, 75766, 75796, 75826,
	75856, 75885, 75915, 75944, 75974, 76003, 76032, 76062, 76091, 76121, 76150, 76180, 76210, 76239, 76269, 76299, 76328, 76358, 76387, 76416,
	76446, 76475, 76505, 76534, 76564, 76593, 76623, 76653, 76682, 76712, 76741, 76771, 76801, 76830, 76859, 76889, 76918, 76948, 76977, 77007,
	77036, 77066, 77096, 77125, 77155, 77185, 77214, 77243, 77273, 77302, 77332, 77361, 77390, 77420, 77450, 77479, 77509, 77539, 77569, 77598,
	77627, 77657, 77686, 77715, 77745, 77774, 77804, 77833, 77863, 77893, 77923, 77952, 77982, 78011, 78041, 78070, 78099, 78129, 78158, 78188,
	78217, 78247, 78277, 78307, 78336, 78366, 78395, 78425, 78454, 78483, 78513, 78542, 78572, 78601, 78631, 78661, 78690, 78720, 78750, 78779,
	78808, 78838, 78867, 78897, 78926, 78956, 78985, 79015, 79044, 79074, 79104, 79133, 79163, 79192, 79222, 79251, 79281, 79310, 79340, 79369,
	79399, 79428, 79458, 79487, 79517, 79546, 79576, 79606, 79635, 79665, 79695, 79724, 79753, 79783, 79812, 79841, 79871, 79900, 79930, 79960,
	79990];

})(jQuery);
