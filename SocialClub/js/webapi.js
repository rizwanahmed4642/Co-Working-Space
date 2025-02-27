﻿//////////// Languages
var langs = [
  ['Afrikaans', ['af-ZA']],
  ['Bahasa Indonesia', ['id-ID']],
  ['Bahasa Melayu', ['ms-MY']],
  ['Català', ['ca-ES']],
  ['Čeština', ['cs-CZ']],
  ['Deutsch', ['de-DE']],
  ['English', ['en-AU', 'Australia'],
    ['en-CA', 'Canada'],
    ['en-IN', 'India'],
    ['en-NZ', 'New Zealand'],
    ['en-ZA', 'South Africa'],
    ['en-GB', 'United Kingdom'],
    ['en-US', 'United States']
  ],
  ['Español', ['es-AR', 'Argentina'],
    ['es-BO', 'Bolivia'],
    ['es-CL', 'Chile'],
    ['es-CO', 'Colombia'],
    ['es-CR', 'Costa Rica'],
    ['es-EC', 'Ecuador'],
    ['es-SV', 'El Salvador'],
    ['es-ES', 'España'],
    ['es-US', 'Estados Unidos'],
    ['es-GT', 'Guatemala'],
    ['es-HN', 'Honduras'],
    ['es-MX', 'México'],
    ['es-NI', 'Nicaragua'],
    ['es-PA', 'Panamá'],
    ['es-PY', 'Paraguay'],
    ['es-PE', 'Perú'],
    ['es-PR', 'Puerto Rico'],
    ['es-DO', 'República Dominicana'],
    ['es-UY', 'Uruguay'],
    ['es-VE', 'Venezuela']
  ],
  ['Euskara', ['eu-ES']],
  ['Français', ['fr-FR']],
  ['Galego', ['gl-ES']],
  ['Hrvatski', ['hr_HR']],
  ['IsiZulu', ['zu-ZA']],
  ['Íslenska', ['is-IS']],
  ['Italiano', ['it-IT', 'Italia'],
    ['it-CH', 'Svizzera']
  ],
  ['Magyar', ['hu-HU']],
  ['Nederlands', ['nl-NL']],
  ['Norsk bokmål', ['nb-NO']],
  ['Polski', ['pl-PL']],
  ['Português', ['pt-BR', 'Brasil'],
    ['pt-PT', 'Portugal']
  ],
  ['Română', ['ro-RO']],
  ['Slovenčina', ['sk-SK']],
  ['Suomi', ['fi-FI']],
  ['Svenska', ['sv-SE']],
  ['Türkçe', ['tr-TR']],
  ['български', ['bg-BG']],
  ['Pусский', ['ru-RU']],
  ['Српски', ['sr-RS']],
  ['한국어', ['ko-KR']],
  ['中文', ['cmn-Hans-CN', '普通话 (中国大陆)'],
    ['cmn-Hans-HK', '普通话 (香港)'],
    ['cmn-Hant-TW', '中文 (台灣)'],
    ['yue-Hant-HK', '粵語 (香港)']
  ],
  ['日本語', ['ja-JP']],
  ['Lingua latīna', ['la']]
];

for (var i = 0; i < langs.length; i++) {
  select_language.options[i] = new Option(langs[i][0], i);
}

// GC browser language
var userLang = navigator.language || navigator.userLanguage;
//var userLang = 'en';
var lang = '';
var dialect = '';
//alert ("The language is: " + userLang);
if (userLang === 'fr') {
  lang = 9;
  dialect = 9;
} else {
  lang = 6;
  dialect = 6;
}
// GC end

select_language.selectedIndex = "en-US";
updateCountry();
select_dialect.selectedIndex = dialect;
showInfo('info_start');

function updateCountry() {
  for (var i = select_dialect.options.length - 1; i >= 0; i--) {
    select_dialect.remove(i);
  }
  var list = langs[select_language.selectedIndex];
  for (var i = 1; i < list.length; i++) {
    select_dialect.options.add(new Option(list[i][1], list[i][0]));
  }
  select_dialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
}

var create_email = false;
var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;
if (!('webkitSpeechRecognition' in window)) {
  upgrade();
} else {
  start_button.style.display = 'inline-block';
  var recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = function() {
    recognizing = true;
    showInfo('info_speak_now');
    start_img.src = '//google.com/intl/en/chrome/assets/common/images/content/mic-animate.gif';
  };

  recognition.onerror = function(event) {
    if (event.error == 'no-speech') {
      start_img.src = '//google.com/intl/en/chrome/assets/common/images/content/mic.gif';
      showInfo('info_no_speech');
      ignore_onend = true;
    }
    if (event.error == 'audio-capture') {
      start_img.src = '//google.com/intl/en/chrome/assets/common/images/content/mic.gif';
      showInfo('info_no_microphone');
      ignore_onend = true;
    }
    if (event.error == 'not-allowed') {
      if (event.timeStamp - start_timestamp < 100) {
        showInfo('info_blocked');
      } else {
        showInfo('info_denied');
      }
      ignore_onend = true;
    }
  };

  recognition.onend = function() {
    recognizing = false;
    if (ignore_onend) {
      return;
    }
    start_img.src = '//google.com/intl/en/chrome/assets/common/images/content/mic.gif';
    if (!final_transcript) {
      showInfo('info_start');
      return;
    }
    showInfo('');
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
      var range = document.createRange();
      range.selectNode(document.getElementById('final_span'));
      window.getSelection().addRange(range);
      //alert('end');
    }
    if (create_email) {
      create_email = false;
      createEmail();
    }
  };

  recognition.onresult = function(event) {

    var interim_transcript = '';
    if (typeof(event.results) == 'undefined') {
      recognition.onend = null;
      recognition.stop();
      upgrade();
      return;
    }
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
        //GC in textarea id #content
        // ADD TEXT TO SPEECH
        //speechSynthesis.speak(event.results[i][0].transcript);
        //alert(event.results[i][0].transcript);
        vc_search(event.results[i][0].transcript);
        content.value += event.results[i][0].transcript;
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }
    final_transcript = capitalize(final_transcript);
    final_span.innerHTML = linebreak(final_transcript);
    interim_span.innerHTML = linebreak(interim_transcript);
    //GC
    //info_speak_now.innerHTML = linebreak(final_transcript);
    info_txt.innerHTML = linebreak(interim_transcript);
    //GC end
    if (final_transcript || interim_transcript) {
      showButtons('inline-block');
    }
  };
}

function upgrade() {
  start_button.style.visibility = 'hidden';
  showInfo('info_upgrade');
}

var two_line = /\n\n/g;
var one_line = /\n/g;

function linebreak(s) {
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

var first_char = /\S/;

function capitalize(s) {
  return s.replace(first_char, function(m) {
    return m.toUpperCase();
  });
}

function createEmail() {
  var n = final_transcript.indexOf('\n');
  if (n < 0 || n >= 80) {
    n = 40 + final_transcript.substring(40).indexOf(' ');
  }
  var subject = encodeURI(final_transcript.substring(0, n));
  var body = encodeURI(final_transcript.substring(n + 1));
  window.location.href = 'mailto:?subject=' + subject + '&body=' + body;
}

function copyButton() {
  if (recognizing) {
    recognizing = false;
    recognition.stop();
  }
  copy_button.style.display = 'none';
  copy_info.style.display = 'inline-block';
  showInfo('');
}

function emailButton() {
  if (recognizing) {
    create_email = true;
    recognizing = false;
    recognition.stop();
  } else {
    createEmail();
  }
  email_button.style.display = 'none';
  email_info.style.display = 'inline-block';
  showInfo('');
}

function startButton(event) {
  if (recognizing) {
    recognition.stop();
    return;
  }
  final_transcript = '';
  recognition.lang = select_dialect.value;
  recognition.start();
  ignore_onend = false;
  final_span.innerHTML = '';
  interim_span.innerHTML = '';
  start_img.src = '//google.com/intl/en/chrome/assets/common/images/content/mic-slash.gif';
  showInfo('info_allow');
  showButtons('none');
  start_timestamp = event.timeStamp;
}

function showInfo(s) {
  /*
  if (s) {
    for (var child = info.firstChild; child; child = child.nextSibling) {
      if (child.style) {
        child.style.display = child.id == s ? 'inline' : 'none';
      }
    }
    info.style.visibility = 'visible';
  } else {
    info.style.visibility = 'hidden';
  }
*/
  if (s) {
    var txt;
    switch (s) {
      case 'info_start':
        txt = "Click on the microphone icon and begin speaking.";
        break;
      case 'info_speak_now':
        txt = "Speak now.";
        break;
      case 'info_allow':
        txt = 'No speech was detected. You may need to adjust your <a href="//support.google.com/chrome/bin/answer.py?hl=en&amp;answer=1407892"> microphone settings</a>.';
        break;
      case 'info_no_microphone':
        txt = 'No microphone was found. Ensure that a microphone is installed and that <a href="//support.google.com/chrome/bin/answer.py?hl=en&amp;answer=1407892"> microphone settings</a> are configured correctly.';
        break;
      case 'info_allow':
        txt = 'Click the "Allow" button above to enable your microphone.';
        break;
      case 'info_denied':
        txt = "Permission to use microphone is blocked. To change, go to chrome://settings/contentExceptions#media-stream";
        break;
      case 'info_upgrade':
        txt = 'Web Speech API is not supported by this browser. Upgrade to <a href="//www.google.com/chrome">Chrome</a> version 25 or later.';
        break;
    }
    $("#info_txt").html(txt);
  } else {
    //$("#info_txt").html("");
  }

}

var current_style;

function showButtons(style) {
  if (style == current_style) {
    return;
  }
  current_style = style;
  copy_button.style.display = style;
  email_button.style.display = style;
  copy_info.style.display = 'none';
  email_info.style.display = 'none';
}

//GC funtions
$("#lastword").click(function() {

  getLastWord($('#content').val());

  //$('#text').val(removedtext);

});

$("#lastcar").click(function() {

  $('#content').text(function(_, txt) {
    return txt.slice(0, -1);
  });
});

function getLastWord(text) {
  //alert(text);
  text = text.replace(/\w+$/, '');
  text = text.substring(0, text.lastIndexOf(' '));
  //$('#text').html(text);
  $('#content').val(text);
  //$('#content').val(text+' ');
}


function vc_search(message) {
  
  //var tptext = message.text
  console.log(message);
  
  var phrase = common(message);
  
  console.log(phrase);
  
  //url = "http://fr.wikipedia.org/w/api.php?action=query&prop=description&titles=" + message + "&prop=extracts&exintro&explaintext&format=json&redirects&callback=?";
  
  url = "http://fr.wikipedia.org/w/api.php?action=query&prop=description&titles=" + common(message) + "&prop=extracts&exintro&explaintext&exsentences=2&format=json&redirects&callback=?";
  
  //console.log(message)
  
//function WD_i(item) {
        //var be = item
    $.getJSON(url, function (json) {
        var item_id = Object.keys(json.query.pages)[0]; // THIS DO THE TRICK !
        respond = json.query.pages[item_id].extract;
        //sent = json.extract.toString();
        console.log(respond)
        //speechSynthesis.speak('respond');
        //result = "<b>En :</b> <t>" + item + "</t> <b>⇒</b> " + sent;
        //$('#anchor1').append("<div>"+result+"</div>"); // append
        //speechSynthesis.speak(message);
        $('#content').val(respond);
        
        var message = new SpeechSynthesisUtterance(respond);
        $("#start_img").trigger('click');
        
        speechSynthesis.speak(message);
    });
//}
  
  //speechSynthesis.speak(message);
  //newtext[$(this).attr("id")] = $(this).val();
  //newtext.voice = voices[$(this).val()];

}

//TEXT TO SPEECH ////////////////////////////////////////
var message = new SpeechSynthesisUtterance($("#text").val());
var voices = speechSynthesis.getVoices();

$("input").on("change", function() {
  console.log($(this).attr("id"), $(this).val());
  message[$(this).attr("id")] = $(this).val();
});

$("select").on("change", function() {
  message.voice = voices[$(this).val()];
});

$("button#speak").on("click", function() {
  speechSynthesis.speak(message);
});


$(document).ready(function() {
  //var newtext = new SpeechSynthesisUtterance('message');
  //newtext[$(this).attr("id")] = $(this).val();
  //newtext.voice = voices[$(this).val()];
  //speechSynthesis.speak(newtext);

});


// Hack around voices bug
var interval = setInterval(function() {
  voices = speechSynthesis.getVoices();
  if (voices.length) clearInterval(interval);
  else return;

  for (var i = 0; i < voices.length; i++) {
    $("select").append("<option value=\"" + i + "\">" + voices[i].name + "</option>");
  }
}, 10);
////////////////////////////////

// Hack around voices bug
var interval = setInterval(function() {
  voices = speechSynthesis.getVoices();
  if (voices.length) clearInterval(interval);
  else return;

  for (var i = 0; i < voices.length; i++) {
    $("select").append("<option value=\"" + i + "\">" + voices[i].name + "</option>");
  }
}, 10);
////////////////////////////////


//////////  FUNCTIONS /////////////

//REMOVE COMMENT WORKDS
var string = "Qui est le premier ministre du Canada";

function common(s) {
  //var words = ["a", "an", "the", "all", "am", "an", "and", "any", "are", "as", "at", "be", "but", "can", "did", "do", "does", "for", "from", "had", "has", "have", "here", "how", "i", "if", "in", "is", "it", "no", "not", "of", "on", "or", "so", "that", "the", "then", "there", "this", "to", "too", "up", "use", "what", "when", "where", "who", "why", "you"];
  
  var words = ["qui", "que", "quoi", "le", "la", "les", "ont", "il", "ils", "elle", "elles", "be", "but", "lui", "est", "a", "je", "tu", "il", "nous", "vous", "ils", "de", "duQ", "desQ", "sont", "son", "quel", "quels", "quelle", "quelles", "of", "on", "or", "so", "that", "the", "then", "there", "this", "to", "too", "up", "use", "what", "when", "where", "who", "why", "you"];
  
  var re = new RegExp('\\b(' + words.join('|') + ')\\b', 'gi');
  return (s || '').replace(re, '').replace(/[ ]{2,}/, ' ');
}

console.log(common(string))
