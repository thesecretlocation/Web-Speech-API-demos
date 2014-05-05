var match_string = "next";
var final_transcript = '';
var final_span = document.getElementById("final_span");
var interim_span = document.getElementById("interim_span");
var start_img = document.getElementById("start_img");
var start_button = document.getElementById("start_button");
var match_results = document.getElementById("match_results");
var number_of_matches = 0;
var recognizing = false;
var ignore_onend;
var start_timestamp;
var speechRecognition;
var eventResults;
var latest_words = "";
var previousMatch = -1;

// note only webkitSpeechRecognition exists right now, this is just future proofing it
if (('webkitSpeechRecognition' in window) || ('mozSpeechRecognition' in window) || ('msSpeechRecognition' in window) || ('SpeechRecognition' in window)) {
    initSpeechRec();
} else {
    upgrade();
}

function initSpeechRec() {
    start_button.style.display = 'block'; // show the start button only if supported
    
    speechRecognition = new webkitSpeechRecognition();
    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;

    speechRecognition.onstart = function() {
        console.log("It has started!", Date.now());
          
        recognizing = true;
        start_img.src = 'images/mic-animate.gif';
    };

    speechRecognition.onerror = function(event) {
        if (event.error == 'no-speech') {
            start_img.src = 'images/mic.gif';
            ignore_onend = true;
        }
        if (event.error == 'audio-capture') {
            start_img.src = 'images/mic.gif';
            ignore_onend = true;
        }
        if (event.error == 'not-allowed') {
            ignore_onend = true;
        }
        
        console.error("ERROR", event.error, Date.now());
    };

    speechRecognition.onend = function() {
        recognizing = false;
        if (ignore_onend) {
            return;
        }
        start_img.src = 'images/mic.gif';
        if (!final_transcript) {
            return;
        }
        
        console.log("It has ended!", Date.now());
        //startButton();
    };

    speechRecognition.onresult = function(event) {
        /*
        Example of SpeechRecognitionEvent data
        event.results: SpeechRecognitionResultList
        0: SpeechRecognitionResult
        0: SpeechRecognitionAlternative
        confidence: 0.009999999776482582
        transcript: "test"
        */
        
        var interim_transcript = '';
        if (typeof(event.results) == 'undefined') {
            //speechRecognition.onend = null;
            //speechRecognition.stop();
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
            match_results.innerHTML = number_of_matches + " matches";
        }
        
        console.log("latest_words", latest_words);
        
        //console.log("final_transcript", final_transcript, Date.now());
        //console.log("interim_transcript", interim_transcript, Date.now());
        final_transcript = capitalize(final_transcript);
        final_span.innerHTML = linebreak(final_transcript);
        interim_span.innerHTML = linebreak(interim_transcript);

    };   
}

function upgrade() {
    start_button.style.visibility = 'hidden';
    
    var msg = "This functionality is currently on available in Chrome 25+ desktop, Chrome 33+ for mobile";
    final_span.innerHTML = msg;
    console.error(msg);
}

function startButton() {
    if (recognizing) {
        speechRecognition.stop();
        return;
    }
    final_transcript = '';
    speechRecognition.lang = 'en-CA'; // English Canada
    speechRecognition.start();
    ignore_onend = false;
    start_img.src = 'images/mic-slash.gif';
}

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