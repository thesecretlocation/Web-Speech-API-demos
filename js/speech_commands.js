var match_string = "next";
var final_transcript = '';
var number_of_matches = 0;
var recognizing = false;
var ignore_onend;
var start_timestamp;
var speechRecognition;
var eventResults;
var latest_words = "";
var previousMatch = -1;

var speechCommands = {
	_this: null,
	match_string: "next page",
	speechRecognition:null,
	
	init:function() {
		_this = this;
		
		// checks to see if SpeechRecognition otherwise asks the user to upgrade
		// note only webkitSpeechRecognition exists right now, this is just future proofing it
		if (('webkitSpeechRecognition' in window) || ('mozSpeechRecognition' in window) || ('msSpeechRecognition' in window) || ('SpeechRecognition' in window)) {
			_this.setSpeechRecEvents();
		} else {
			_this.browserNotSupporter();
		}
	},
	
	setSpeechRecEvents:function () {
		_this.speechRecognition = new webkitSpeechRecognition();
		
		_this.speechRecognition.continuous = true;
		_this.speechRecognition.interimResults = true;

		_this.speechRecognition.onstart = _this.speechOnStartHandler;
		_this.speechRecognition.onerror = _this.speechOnErrorHandler;
		_this.speechRecognition.onend = _this.speechOnEndHandler;
		_this.speechRecognition.onresult = _this.speechOnResultHandler;
	},
	
	speechOnStartHandler:function(event) {
		console.log("It has started!", Date.now());
          
        recognizing = true;
	},
	speechOnErrorHandler:function(event) {
		if (event.error == 'no-speech') {
            ignore_onend = true;
        } else if (event.error == 'audio-capture') {
            ignore_onend = true;
        } else if (event.error == 'not-allowed') {
            ignore_onend = true;
        }
		console.error("ERROR", event.error, Date.now());
	},
	speechOnEndHandler:function(event) {
		recognizing = false;
        if (ignore_onend) {
            return;
        }
        if (!final_transcript) {
            return;
        }
        
        console.log("It has ended!", Date.now());
	},
	speechOnResultHandler:function(event) {
		var interim_transcript = '';
        if (typeof(event.results) == 'undefined') {
            //this.speechRecognition.onend = null;
            //this.speechRecognition.stop();
            console.log("No results from SpeechRecognitionEvent", Date.now());
            return;
        }
        eventResults = event.results;
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                latest_words = event.results[i][0].transcript;
                final_transcript += latest_words;
            } else {
                interim_transcript += event.results[i][0].transcript;
            }            
            console.log("event.results[" + i + "][0].transcript", event.results[i][0].transcript, Date.now());
        }
        
        if ((latest_words.indexOf(match_string) > -1) && (previousMatch != event.results.length)) {
            latest_words = "";
            previousMatch = event.results.length;
            console.warn("Match found!", event.results.length);
            number_of_matches++;
        }
        
        console.log("latest_words", latest_words);
        
        //console.log("final_transcript", final_transcript, Date.now());
        //console.log("interim_transcript", interim_transcript, Date.now());
        final_transcript = capitalize(final_transcript);
        console.log("transcript:", linebreak(final_transcript));
        console.log("interim:", linebreak(interim_transcript));
	},
	
	browserNotSupporter:function() {
		var msg = "This functionality is currently on available in Chrome 25+ desktop, Chrome 33+ for mobile";
		console.error(msg);
	},
	
	startSpeechRecog:function() {
		if (recognizing) {
			_this.speechRecognition.stop();
			return;
		}
		final_transcript = '';
		_this.speechRecognition.lang = 'en-CA'; // English Canada
		_this.speechRecognition.start();
		ignore_onend = false;
	},	
}

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

