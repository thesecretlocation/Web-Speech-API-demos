var speechCommands = {
	_this: null,
	match_string: "next page",
	speechRecognition: null,
	final_transcript: "",
	number_of_matches: 0,
	recognizing: false,
	ignore_onend: false,
	previousMatch: -1,
	
	init:function() {
		_this = this;
		
		// checks to see if SpeechRecognition otherwise asks the user to upgrade
		// note only webkitSpeechRecognition exists right now, this is just future proofing it
		if (('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window)) {
			_this.speechRecognition = new webkitSpeechRecognition();
			_this.speechRecognition.continuous = true; // speech will continue after small pauses and will only stop after a very long pause
			_this.speechRecognition.interimResults = true; // determines whether interim data is sent or if it is just final data
		
			_this.setSpeechRecEvents();
		} else {
			_this.browserNotSupported();
		}
	},
	
	setSpeechRecEvents:function () {
		_this.speechRecognition.onstart = _this.speechOnStartHandler;
		_this.speechRecognition.onerror = _this.speechOnErrorHandler;
		_this.speechRecognition.onend = _this.speechOnEndHandler;
		_this.speechRecognition.onresult = _this.speechOnResultHandler;
	},
	
	speechOnStartHandler:function(event) {
		console.log("It has started!", Date.now());
          
        _this.recognizing = true;
	},
	speechOnErrorHandler:function(event) {
		if (event.error == 'no-speech') {
            _this.ignore_onend = true;
        } else if (event.error == 'audio-capture') {
            _this.ignore_onend = true;
        } else if (event.error == 'not-allowed') {
            _this.ignore_onend = true;
        }
		console.error("ERROR", event.error, Date.now());
	},
	speechOnEndHandler:function(event) {
		_this.recognizing = false;
		
        if (_this.ignore_onend) {
            return;
        }
        if (!_this.final_transcript) {
            return;
        }
        
        console.log("It has ended!", Date.now());
	},
	speechOnResultHandler:function(event) {
		var interim_transcript = '';
		var eventResults = event.results;
		
        if (typeof(eventResults) == 'undefined') {
            //this.speechRecognition.onend = null;
            //this.speechRecognition.stop();
            console.log("No results from SpeechRecognitionEvent", Date.now());
            return;
        }
		var latest_words = "";
        for (var i = event.resultIndex; i < eventResults.length; ++i) {
            if (eventResults[i].isFinal) {
                latest_words = eventResults[i][0].transcript;
                _this.final_transcript += latest_words;
            } else {
                interim_transcript += eventResults[i][0].transcript;
            }            
            console.log("eventResults[" + i + "][0].transcript", eventResults[i][0].transcript, Date.now());
        }
        
        if ((latest_words.indexOf(_this.match_string) > -1) && (_this.previousMatch != eventResults.length)) {
            latest_words = "";
            _this.previousMatch = eventResults.length;
            console.warn("Match found!", eventResults.length);
            _this.number_of_matches++;
        }
        
        console.log("latest_words", latest_words);
        
        //console.log("_this.final_transcript", _this.final_transcript, Date.now());
        //console.log("interim_transcript", interim_transcript, Date.now());
        _this.final_transcript = capitalize(_this.final_transcript);
        console.log("transcript:", linebreak(_this.final_transcript));
        console.log("interim:", linebreak(interim_transcript));
	},
	
	browserNotSupported:function() {
		console.error("This functionality is currently on available in Chrome 25+ desktop, Chrome 33+ for Android");
	},
	
	startSpeechRecog:function() {
		if (_this.recognizing) {
			_this.speechRecognition.stop();
			return;
		}
		_this.final_transcript = '';
		_this.speechRecognition.lang = 'en-CA'; // English Canada
		_this.speechRecognition.start();
		_this.ignore_onend = false;
	},	
};

speechCommands.init();

window.onload = speechCommands.startSpeechRecog;

var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
    return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

var first_char = /\S/;
function capitalize(s) {
    return s.replace(first_char, function(m) { return m.toUpperCase(); });
}

/*
Available language & accents
[['English',
    ['en-AU', 'Australia'],
    ['en-CA', 'Canada'],
    ['en-IN', 'India'],
    ['en-NZ', 'New Zealand'],
    ['en-ZA', 'South Africa'],
    ['en-GB', 'United Kingdom'],
    ['en-US', 'United States']],
['Français',
    ['fr-FR']]
];

*/

// Date.now polyfill
if (!Date.now) {
  Date.now = function now() {
    return (new Date().getTime());
  };
}

