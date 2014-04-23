var match_string = "next";
var final_transcript = '';
var final_span = document.getElementById("final_span");
var interim_span = document.getElementById("interim_span");
var start_img = document.getElementById("start_img");
var start_button = document.getElementById("start_button");
var recognizing = false;
var ignore_onend;
var start_timestamp;
var speechRecognition;

if (!('webkitSpeechRecognition' in window)) {
    upgrade();
} else {
    initSpeechRec();
}

function initSpeechRec() {
    console.log("initSpeechRec");
    start_button.style.display = 'block';
    
    speechRecognition = new webkitSpeechRecognition();
    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;

    speechRecognition.onstart = function() {
        console.log("It has started!", new Date().getTime());
          
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
        
        console.error("ERROR", event.error, new Date().getTime());
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
        
        console.log("It has ended!", new Date().getTime());
        startButton();
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
            console.log("No results from SpeechRecognitionEvent",  new Date().getTime());
            return;
        }
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }

        if (final_transcript.indexOf(match_string) > -1) {
            alert("Next!");
        }

        console.log("final_transcript", final_transcript, new Date().getTime());
        console.log("interim_transcript", interim_transcript, new Date().getTime());
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

var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
    return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

var first_char = /\S/;
function capitalize(s) {
    return s.replace(first_char, function(m) { return m.toUpperCase(); });
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
    //start_timestamp = event.timeStamp;
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