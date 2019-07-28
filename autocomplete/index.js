/** @description The main object for handling the autocomplete functionality.*/
const ATCOMP = {}

/** @description Location for the requesting API url */
ATCOMP._requestPrefix = `autocomplete/requests.php?query=__string__`;


/** @description Returns the content for the search-bar input*/
ATCOMP._getQueryString = function(){
	return document.getElementById(ATCOMP.ids.searchBarInput).value;
}

/** @description IDs for the  different objects*/
ATCOMP.ids = {
	searchContainer: "searchContainer",
	searchBarInput: "searchBar",
	dataList: "autocomplete_datalist"
}

/** @description Class names based on index.css */
ATCOMP.classes = {
	shadowedOption: "shadowed",
	hiddenList: "hidden",
	shownList: "shown"
}

/** @description Results object from the request on server */
ATCOMP._queryResult = {
	query:"",
	results:[{
		phrase:""
	}]
}

/** @description Timestamp for the last option selected at */
ATCOMP._lastOpSel = 0;

/** @description The time limiter sub-object, which is required for time-limiting the requests to the server */
ATCOMP._timeLimiter = {
	_lastPressAt: 0,
	_timerRunning: false,
	_timerObj: null,
	_millisTreshold: 300,
	setTimer: function(callback){
		if(ATCOMP._timerObj != null){
			clearTimeout(ATCOMP._timerObj);
		}
		ATCOMP._timeLimiter._timerRunning = true;
		ATCOMP._timerObj = setTimeout(function(){
			ATCOMP._timeLimiter._timerRunning = false;
			callback();
		}, ATCOMP._timeLimiter._millisTreshold);
	},
	clearTimer: function(){
		//console.log("clearTimer called...");
		clearTimeout(ATCOMP._timeLimiter._timerObj);
		ATCOMP._timeLimiter._timerRunning = false;
	}
}


/** @description Allows the settings to be set and retrieved when working with it, as well as 
 * the initialization checkbox on the settings page.
*/
ATCOMP._settings = {
	_values:{
		_ids:{
			checkbox: 'suggestions-checkbox',
			checkboxLabel: 'suggestions-label',
			checkboxWrapper: 'checkbox-wrapper'
		},
		_names: {
			checkbox: 'suggestions-checkbox',
			checkboxLabel: 'suggestions-label'
		},
		_content:{
			checkboxLabel: '&nbsp;Enable Search Suggestions'
		},
		_classes:{
			label:'settings-label'
		}
	},
	_enabled: () => {
		return (localStorage.getItem(ATCOMP._settings._values._ids.checkbox) === "true");
	},
	_setCheckedStatus: function(checked){
		localStorage.setItem(ATCOMP._settings._values._ids.checkbox, checked);
		if(checked){
			ATCOMP._fetchSuggestions(ATCOMP._getQueryString());
			document.getElementById(ATCOMP.ids.searchBarInput).focus();
		}
	},
	_getWrapper: () => document.getElementById(ATCOMP._settings._values._ids.checkboxWrapper),
	_getCheckbox: () => document.getElementById(ATCOMP._settings._values._ids.checkbox),
	_generateLabel: function(){
		let element = document.createElement("label");
		element.id = ATCOMP._settings._values._ids.checkboxLabel;
		element.name = ATCOMP._settings._values._names.checkboxLabel;
		element.htmlFor = ATCOMP._settings._values._ids.checkbox;
		element.innerHTML = ATCOMP._settings._values._content.checkboxLabel;
		element.classList.add(ATCOMP._settings._values._classes.label)
		return element;
	},
	_generateCheckbox: function(callback){
		let element = document.createElement("input");
		element.type = 'checkbox';
		element.id = ATCOMP._settings._values._ids.checkbox;
		element.name = ATCOMP._settings._values._names.checkbox;
		element.checked = ATCOMP._settings._enabled();		
		element.addEventListener('change', callback)
		return element;
	},
	_generateCheckboxSpan: function(){
		let element = document.createElement("span");
		element.classList.add('checkbox');
		return element;
	},
	_setUpSettings: function(){
		let span = ATCOMP._settings._generateCheckboxSpan();
		let label = ATCOMP._settings._generateLabel();
		span.append(ATCOMP._settings._generateCheckbox(function(event){
			ATCOMP._settings._setCheckedStatus(event.srcElement.checked);
		}));
		span.append(label);
		ATCOMP._settings._getWrapper().append(span);
	}
}


/** @description Index of the suggestion result shadowed */
ATCOMP._selectedResultIndex = -1;


/** @description Sets-up the searchbar and datalist component */
ATCOMP._setUpComponent = function(){
	//We set up the datalist for the input
	document.getElementById(ATCOMP.ids.searchBarInput).list = ATCOMP.ids.dataList;

	//We initialize the datalist and append it after the input.
	let datalist = document.createElement("datalist");
	datalist.id = ATCOMP.ids.dataList;
	datalist.classList.add(ATCOMP.classes.shownList);
	document.getElementById(ATCOMP.ids.searchBarInput).after(datalist);

	//We initialize the settings
	ATCOMP._settings._setUpSettings();
}

/** @description Clears the datalist containing the items. */
ATCOMP._clearList = function(){
	//Resets the listing results and elements
	ATCOMP._selectedResultIndex = -1;
	ATCOMP._queryResult = {};
	document.getElementById(ATCOMP.ids.dataList).innerHTML = "";
}

/** @description Handles the suggestion selection click.
 * @param event The HTML event fired when selecting an option
*/
ATCOMP._handleSuggestionSelection = function(event){
	let indexOf = ATCOMP._queryResult.results.findIndex((el)=>{
		if(el.phrase === event.srcElement.value){
			return true;
		}
		return false;
	})
	if(indexOf > -1){
		ATCOMP._selectedResultIndex = indexOf;
		ATCOMP._setSelectedResult();
		ATCOMP._lastOpSel = new Date().getTime();
		event.preventDefault();
	}else{
		console.log("Could not find the item...");
	}
}

ATCOMP._setNoSuggestionsFound = function(){
	let option = document.createElement("option");
	option.innerText = "No search suggestions found...";
	option.value = -1;
	document.getElementById(ATCOMP.ids.dataList).appendChild(option);
}

/** @description Sets the gotten results for the datalist
 * @param resultObj Is the result object gotten from the server.
*/
ATCOMP._setResults = function(resultObj){
	ATCOMP._clearList();
	ATCOMP._queryResult = resultObj;
	ATCOMP._queryResult.results = ATCOMP._queryResult.results.filter((el)=>{	//We filter the required objects
		return (el.phrase.trim() !== ATCOMP._getQueryString().trim())
	});
	if(ATCOMP._queryResult.results.length < 1){	//If no search suggestions found, we take care of it.
		ATCOMP._setNoSuggestionsFound();
		return;
	}
	ATCOMP._queryResult.results.forEach((element)=>{
		let option = document.createElement("option");
		option.innerText = element.phrase;
		option.value = element.phrase;
		option.addEventListener('click', ATCOMP._handleSuggestionSelection);
		document.getElementById(ATCOMP.ids.dataList).appendChild(option);
	});
}

/**
 * @description Gets the results from the server and plots them against the datalist
 * @param string The string to search into the server.
 */
ATCOMP._fetchSuggestions = function(query){
	//console.log("ATCOMP._fetchSuggestions ",1);
	if(ATCOMP._timeLimiter._timerRunning){
		//console.log("ATCOMP._fetchSuggestions ",2);
		ATCOMP._timeLimiter.clearTimer();			//We clear any existing calls, and we initialize this one anew
		ATCOMP._timeLimiter.setTimer(function(){
			ATCOMP._fetchSuggestions(query);		//After the time ended, we call it again with this query
		});
		return;
	}else{
		//console.log("ATCOMP._fetchSuggestions ",3);
		if(!ATCOMP._timeLimiter._lastPressAt){
			ATCOMP._timeLimiter._lastPressAt = true;	//If it hasn't been pressed yet (initial call)
		}
		ATCOMP._timeLimiter.clearTimer();
		ATCOMP._timeLimiter.setTimer(function(){
			//We'll wait for the timeout.
		});
	}
	//console.log("ATCOMP._fetchSuggestions ",4);
	if((query === ATCOMP._queryResult.query) || !query){
		//console.log("ATCOMP._fetchSuggestions ",5);
		return;
	}

	//console.log("ATCOMP._fetchSuggestions ",6);
	const request = new XMLHttpRequest();
	request.addEventListener('load', function () {
		//console.log("ATCOMP._fetchSuggestions ",7);
		if (request.readyState === 4 && request.status === 200) {
			if(ATCOMP._timeLimiter._timerRunning){
				//console.log("ATCOMP._fetchSuggestions ",8);
				//Another event was activated during this activation. Wait for this one instead.
				return;
			}
			if(ATCOMP._getQueryString() === JSON.parse(request.responseText).query){
				//console.log("ATCOMP._fetchSuggestions ",9);
				if(ATCOMP._queryResult.query !== ATCOMP._getQueryString()){
					//console.log("ATCOMP._fetchSuggestions ",10);
					let obj = JSON.parse(request.responseText);
					ATCOMP._timeLimiter._lastPressAt = new Date().getTime();
					ATCOMP._setResults(obj);
				}
			}else{
				//console.log("ATCOMP._fetchSuggestions ",11);
			}
		}else{
			console.log(request);
		}
	});
	////console.log("CALLING WITH: ",ATCOMP._requestPrefix.replace('__string__', string));
	request.open('GET', ATCOMP._requestPrefix.replace('__string__', query), true);
	request.setRequestHeader('accept', '*');
	request.setRequestHeader('accept-language', '*');
	request.send();
}

/**
 * @description Shadows the result into the displayed results.
 */
ATCOMP._shadowResult = function(){
	let options = document.getElementById(ATCOMP.ids.dataList).querySelectorAll('option');
	for(let i=0;i<options.length;i++){
		if(!options[i].classList.contains(ATCOMP.classes.shadowedOption)){
			if(ATCOMP._selectedResultIndex == i){
				options[i].classList.add(ATCOMP.classes.shadowedOption);
			}
			continue;
		}
		options[i].classList.remove(ATCOMP.classes.shadowedOption);
	}
}

ATCOMP._getXDisplayedOption = function(index){
	let options = document.getElementById(ATCOMP.ids.dataList).querySelectorAll('option');
	return options[index];
}

/**
 * @description Takes care of displaying the selected result and setting it up
 * to the input via the selected index
 */
ATCOMP._setSelectedResult = function(){
	ATCOMP._shadowResult();
	ATCOMP._selectResult();
}

/**
 * @description Selects the result with an n-1 index, given n = current element selected
 */
ATCOMP._shadowPreviousResult = function(){
	//console.log("_shadowPreviousResult");
	if(ATCOMP._selectedResultIndex == -1){	//If has no selected or is not enabled
		return;
	}
	let nextIndex = ATCOMP._selectedResultIndex-1;
	if(ATCOMP._getXDisplayedOption(nextIndex) && ATCOMP._getXDisplayedOption(nextIndex).value == -1){
		return;
	}
	ATCOMP._selectedResultIndex = nextIndex;
	ATCOMP._setSelectedResult();
}

/**
 * @description Selects the result with an n+1 index, given n = current element selected
 */
ATCOMP._shadowNextResult = function(){
	//console.log("_shadowNextResult");
	let nextIndex = null;
	if(ATCOMP._selectedResultIndex == ATCOMP._queryResult.results.length){	//If got to the end of the listing
		nextIndex = 0;
	}else{
		nextIndex = ATCOMP._selectedResultIndex+1;
	}
	if(ATCOMP._getXDisplayedOption(nextIndex) && ATCOMP._getXDisplayedOption(nextIndex).value == -1){
		return;
	}
	ATCOMP._selectedResultIndex = nextIndex;
	ATCOMP._setSelectedResult();
}

/**
 * @description Applies the selected result on the input
 */
ATCOMP._selectResult = function(){
	if(this._canSelectResult()){
		document.getElementById(this.ids.searchBarInput).value = this._queryResult.results[this._selectedResultIndex].phrase;
	}
}

/**
 * @description Adds and remove classes to make the suggestions list invisible
 */
ATCOMP._hideList = function(){
	document.getElementById(this.ids.dataList).classList.remove(ATCOMP.classes.shownList);
	document.getElementById(this.ids.dataList).classList.add(ATCOMP.classes.hiddenList);
}

/**
 * @description Adds and removes classes to make the suggestions list visible
 */
ATCOMP._showList = function(){
	document.getElementById(this.ids.dataList).classList.remove(ATCOMP.classes.hiddenList);
	document.getElementById(this.ids.dataList).classList.add(ATCOMP.classes.shownList);
}

/**
 * @description Wether it can or not select the result for the selected index
 */
ATCOMP._canSelectResult = function(){
	return (this._selectedResultIndex < this._queryResult.results.length) && (this._selectedResultIndex > -1);
}

/**
 * @description Handles the input interactions for the search bar.
 */
ATCOMP._handleInputInteractions = function(){
	//Handles the key-up event to search the suggestions
	document.getElementById(ATCOMP.ids.searchBarInput)
	.addEventListener('keyup', function(){
		if(!ATCOMP._settings._enabled()){
			return;
		}
		if(ATCOMP._getQueryString() && ATCOMP._getQueryString() !== ATCOMP._queryResult.query){
			ATCOMP._fetchSuggestions(ATCOMP._getQueryString());
		}
	});
	document.getElementById(ATCOMP.ids.searchBarInput)
	.addEventListener('input', function(event){
		if(!ATCOMP._getQueryString()){
			ATCOMP._clearList();
		}
	});
	document.getElementById(ATCOMP.ids.searchBarInput)
	.addEventListener('blur', function(){
		//Comment next line when debugging and styling the list elements
		if(!ATCOMP._settings._enabled()){
			ATCOMP._hideList();
			return;
		}
		setTimeout(()=>{
			let diff = (new Date().getTime() - ATCOMP._lastOpSel);
			if(diff > 200){
				//If more than 200 milliseconds since the last option selection
				ATCOMP._hideList();
			}else{
				//Clicked on a suggestion.
				ATCOMP._fetchSuggestions(ATCOMP._getQueryString());
				document.getElementById(ATCOMP.ids.searchBarInput).focus();
			}
		}, 150);
	});
	document.getElementById(ATCOMP.ids.searchBarInput)
	.addEventListener('focus', function(){
		if(!ATCOMP._settings._enabled()){
			return;
		}
		ATCOMP._showList();
	});
	document.getElementById(ATCOMP.ids.searchBarInput)
	.addEventListener('keydown', function(event){
		switch(event.keyCode){
			case 38:
				if(!ATCOMP._settings._enabled()){
					return;
				}
				event.preventDefault();
				ATCOMP._shadowPreviousResult();
			break;
			case 40:
				if(!ATCOMP._settings._enabled()){
					return;
				}
				event.preventDefault();
				ATCOMP._shadowNextResult();
			break;
		}
	});
}

/**@description Initializes the autocomplete component */
ATCOMP.init = function(){
	//Attaches the listener to the search component
	ATCOMP._handleInputInteractions();
	ATCOMP._setUpComponent();
}

ATCOMP.init();