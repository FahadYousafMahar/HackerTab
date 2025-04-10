/** @description The main object for handling the autocomplete functionality.*/
const ATCOMP = {};

/** @description Location for the requesting API urls */
ATCOMP.url = 'https://serp.gghs786.workers.dev/?se={se}&query=';

/** @description Returns the content for the search-bar input*/
ATCOMP._getQueryString = function () {
	return $("#" + ATCOMP.ids.searchBarInput).val();
};

/** @description IDs for the  different objects*/
ATCOMP.ids = {
	searchContainer: "searchContainer",
	searchBarInput: "searchBar",
	dataList: "autocomplete_datalist",
	searchEngines: "searchHelpMenu"
};

/** @description Class names based on index.css */
ATCOMP.classes = {
	shadowedOption: "shadowed",
	hiddenList: "hidden",
	shownList: "shown",
};

/** @description Results object from the request on server */
ATCOMP._queryResult = {
	query: "",
	results: [{
		phrase: "",
	}],
};

/** @description Timestamp for the last option selected at */
ATCOMP._lastOpSel = 0;

/** @description The time limiter sub-object, which is required for time-limiting the requests to the server */
ATCOMP._timeLimiter = {
	_lastPressAt: 0,
	_timerRunning: false,
	_timerObj: null,
	_millisTreshold: 200,
	setTimer: function (callback) {
		if (ATCOMP._timerObj != null) {
			clearTimeout(ATCOMP._timerObj);
		}
		ATCOMP._timeLimiter._timerRunning = true;
		ATCOMP._timerObj = setTimeout(function () {
			ATCOMP._timeLimiter._timerRunning = false;
			callback();
		}, ATCOMP._timeLimiter._millisTreshold);
	},
	clearTimer: function () {
		clearTimeout(ATCOMP._timeLimiter._timerObj);
		ATCOMP._timeLimiter._timerRunning = false;
	},
};

/** @description Allows the settings to be set and retrieved when working with it, as well as
 * the initialization checkbox on the settings page.
 */
ATCOMP._settings = {
	_values: {
		_ids: {
			checkbox: 'suggestions-checkbox',
			checkboxLabel: 'suggestions-label',
			checkboxWrapper: 'checkbox-wrapper'
		},
		_names: {
			checkbox: 'suggestions-checkbox',
			checkboxLabel: 'suggestions-label'
		},
		_content: {
			checkboxLabel: '&nbsp;Enable Search Suggestions'
		},
		_classes: {
			label: 'settings-label'
		}
	},
	_enabled: () => {
		return localStorage.getItem(ATCOMP._settings._values._ids.checkbox) ? (localStorage.getItem(ATCOMP._settings._values._ids.checkbox) === "true") : true;
	},
	_setCheckedStatus: function (checked) {
		localStorage.setItem(ATCOMP._settings._values._ids.checkbox, checked);
		if (checked) {
			ATCOMP._fetchSuggestions(ATCOMP._getQueryString());
			$("#" + ATCOMP.ids.searchBarInput).focus();
		}
	},
	_getWrapper: () => $("#" + ATCOMP._settings._values._ids.checkboxWrapper),
	_getCheckbox: () => $("#" + ATCOMP._settings._values._ids.checkbox),
	_generateLabel: function () {
		let element = $("<label>", {
			id: ATCOMP._settings._values._ids.checkboxLabel,
			name: ATCOMP._settings._values._names.checkboxLabel,
			htmlFor: ATCOMP._settings._values._ids.checkbox,
			html: ATCOMP._settings._values._content.checkboxLabel,
			class: ATCOMP._settings._values._classes.label
		});
		return element;
	},
	_generateCheckbox: function (callback) {
		let element = $("<input>", {
			type: 'checkbox',
			id: ATCOMP._settings._values._ids.checkbox,
			name: ATCOMP._settings._values._names.checkbox,
			checked: ATCOMP._settings._enabled()
		}).on('change', callback);
		return element;
	},
	_generateCheckboxSpan: function () {
		let element = $("<span>").addClass('checkbox');
		return element;
	},
	_setUpSettings: function () {
		let span = ATCOMP._settings._generateCheckboxSpan();
		let label = ATCOMP._settings._generateLabel();
		span.append(ATCOMP._settings._generateCheckbox(function (event) {
			ATCOMP._settings._setCheckedStatus(event.target.checked);
		}));
		span.append(label);
		ATCOMP._settings._getWrapper().append(span);
	}
};

/** @description Index of the suggestion result shadowed */
ATCOMP._selectedResultIndex = -1;

/** @description Sets-up the searchbar and datalist component */
ATCOMP._setUpComponent = function () {
	$("#" + ATCOMP.ids.searchBarInput).attr('list', ATCOMP.ids.dataList);
	let datalist = $("<div>", {
		id: ATCOMP.ids.dataList,
		class: ATCOMP.classes.shownList
	});
	$("#" + ATCOMP.ids.searchBarInput).after(datalist);
	ATCOMP._settings._setUpSettings();
};

/** @description Clears the datalist containing the items. */
ATCOMP._clearList = function () {
	ATCOMP._selectedResultIndex = -1;
	ATCOMP._queryResult = {};
	$("#" + ATCOMP.ids.dataList).empty();
	$("#" + ATCOMP.ids.searchEngines).show();
};

/** @description Handles the suggestion selection click.
 * @param event The HTML event fired when selecting an option
 */
ATCOMP._handleSuggestionSelection = function (event) {
	let indexOf = ATCOMP._queryResult.results.findIndex((el) => {
		if (el.phrase === event.target.value) {
			return true;
		}
		return false;
	});
	if (indexOf > -1) {
		ATCOMP._selectedResultIndex = indexOf;
		ATCOMP._setSelectedResult();
		ATCOMP._lastOpSel = new Date().getTime();
		event.preventDefault();
	} else {
		console.log("Could not find the item...");
	}
};

ATCOMP._setNoSuggestionsFound = function () {
	let option = $("<option>", {
		text: "No search suggestions found...",
		value: -1
	});
	$("#" + ATCOMP.ids.dataList).append(option);
};

/** @description Sets the gotten results for the datalist
 * @param resultObj Is the result object gotten from the server.
 */
ATCOMP._setResults = function (resultObj) {
	ATCOMP._clearList();
	ATCOMP._queryResult = resultObj;
	ATCOMP._queryResult.results = ATCOMP._queryResult.results.filter((el) => {
		return (el.phrase.trim() !== ATCOMP._getQueryString().trim());
	});
	if (ATCOMP._queryResult.results.length < 1) {
		ATCOMP._setNoSuggestionsFound();
		return;
	}
	ATCOMP._queryResult.results.forEach((element) => {
		let option = $("<option>", {
			text: element.phrase,
			value: element.phrase
		}).on('click', ATCOMP._handleSuggestionSelection);
		$("#" + ATCOMP.ids.dataList).append(option);
	});
	$("#" + ATCOMP.ids.searchEngines).hide();
};

/**
 * @description Gets the results from the server and plots them against the datalist
 * @param string The string to search into the server.
 */
ATCOMP._fetchSuggestions = function (query) {
	let source = searchSources[ssi][0];
	if (ATCOMP._timeLimiter._timerRunning) {
		ATCOMP._timeLimiter.clearTimer();
		ATCOMP._timeLimiter.setTimer(function () {
			ATCOMP._fetchSuggestions(query);
		});
		return;
	} else {
		if (!ATCOMP._timeLimiter._lastPressAt) {
			ATCOMP._timeLimiter._lastPressAt = true;
		}
		ATCOMP._timeLimiter.clearTimer();
		ATCOMP._timeLimiter.setTimer(function () {
			if ((query === ATCOMP._queryResult.query) || !query) {
				return;
			}
			$.ajax({
				url: ATCOMP.url.replace('{se}',source) + query,
				dataType: 'json',
				success: function (data) {
					ATCOMP._timeLimiter._lastPressAt = new Date().getTime();
					ATCOMP._setResults({ query: query, results: [...new Set(data.map(JSON.stringify))].map(JSON.parse) });

				},
				error: function (error) {
					console.error("Error fetching " + source + ":", error);
					ATCOMP._timeLimiter._lastPressAt = new Date().getTime();
					ATCOMP._setResults({ query: query, results: [...new Set([].map(JSON.stringify))].map(JSON.parse) });
				}
			});
		});
	}
};

/**
 * @description Shadows the result into the displayed results.
 */
ATCOMP._shadowResult = function () {
	let options = $("#" + ATCOMP.ids.dataList).find('option');
	options.each(function (i) {
		if (!$(this).hasClass(ATCOMP.classes.shadowedOption)) {
			if (ATCOMP._selectedResultIndex == i) {
				$(this).addClass(ATCOMP.classes.shadowedOption);
			}
			return;
		}
		$(this).removeClass(ATCOMP.classes.shadowedOption);
	});
};

ATCOMP._getXDisplayedOption = function (index) {
	return $("#" + ATCOMP.ids.dataList).find('option').eq(index);
};

/**
 * @description Takes care of displaying the selected result and setting it up
 * to the input via the selected index
 */
ATCOMP._setSelectedResult = function () {
	ATCOMP._shadowResult();
	ATCOMP._selectResult();
};

/**
 * @description Selects the result with an n-1 index, given n = current element selected
 */
ATCOMP._shadowPreviousResult = function () {
	if (ATCOMP._selectedResultIndex == -1) {
		return;
	}
	let nextIndex = ATCOMP._selectedResultIndex - 1;
	if (ATCOMP._getXDisplayedOption(nextIndex).length && ATCOMP._getXDisplayedOption(nextIndex).val() == -1) {
		return;
	}
	ATCOMP._selectedResultIndex = nextIndex;
	ATCOMP._setSelectedResult();
};

/**
 * @description Selects the result with an n+1 index, given n = current element selected
 */
ATCOMP._shadowNextResult = function () {
	let nextIndex = null;
	if (ATCOMP._selectedResultIndex == ATCOMP._queryResult.results.length) {
		nextIndex = 0;
	} else {
		nextIndex = ATCOMP._selectedResultIndex + 1;
	}
	if (ATCOMP._getXDisplayedOption(nextIndex).length && ATCOMP._getXDisplayedOption(nextIndex).val() == -1) {
		return;
	}
	ATCOMP._selectedResultIndex = nextIndex;
	ATCOMP._setSelectedResult();
};

/**
 * @description Applies the selected result on the input
 */
ATCOMP._selectResult = function () {
	if (this._canSelectResult()) {
		$("#" + this.ids.searchBarInput).val(this._queryResult.results[this._selectedResultIndex].phrase);
	}
};

/**
 * @description Adds and remove classes to make the suggestions list invisible
 */
ATCOMP._hideList = function () {
	$("#" + this.ids.dataList).removeClass(ATCOMP.classes.shownList).addClass(ATCOMP.classes.hiddenList);
};

/**
 * @description Adds and removes classes to make the suggestions list visible
 */
ATCOMP._showList = function () {
	$("#" + this.ids.dataList).removeClass(ATCOMP.classes.hiddenList).addClass(ATCOMP.classes.shownList);
};

/**
 * @description Wether it can or not select the result for the selected index
 */
ATCOMP._canSelectResult = function () {
	return (this._selectedResultIndex < this._queryResult.results.length) && (this._selectedResultIndex > -1);
};

/**
 * @description Handles the input interactions for the search bar.
 */
ATCOMP._handleInputInteractions = function () {
	$("#" + ATCOMP.ids.searchBarInput).on('keyup', function () {
		if (!ATCOMP._settings._enabled()) {
			return;
		}
		if (ATCOMP._getQueryString() && ATCOMP._getQueryString() !== ATCOMP._queryResult.query) {
			ATCOMP._fetchSuggestions(ATCOMP._getQueryString());
		}
	}).on('input', function (event) {
		if (!ATCOMP._getQueryString()) {
			ATCOMP._clearList();
		}
	}).on('blur', function () {
		if (!ATCOMP._settings._enabled()) {
			ATCOMP._hideList();
			return;
		}
		setTimeout(() => {
			let diff = (new Date().getTime() - ATCOMP._lastOpSel);
			if (diff > 200) {
				ATCOMP._hideList();
			} else {
				ATCOMP._fetchSuggestions(ATCOMP._getQueryString());
				$("#" + ATCOMP.ids.searchBarInput).focus();
			}
		}, 150);
	}).on('focus', function () {
		if (!ATCOMP._settings._enabled()) {
			return;
		}
		ATCOMP._showList();
	}).on('keydown', function (event) {
		switch (event.keyCode) {
			case 38:
				if (!ATCOMP._settings._enabled()) {
					return;
				}
				event.preventDefault();
				ATCOMP._shadowPreviousResult();
				break;
			case 40:
				if (!ATCOMP._settings._enabled()) {
					return;
				}
				event.preventDefault();
				ATCOMP._shadowNextResult();
				break;
		}
	});
};

/**@description Initializes the autocomplete component */
ATCOMP.init = function () {
	ATCOMP._handleInputInteractions();
	ATCOMP._setUpComponent();
};