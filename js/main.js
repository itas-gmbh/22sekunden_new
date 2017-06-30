/*
*  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
*
*  Use of this source code is governed by a BSD-style license
*  that can be found in the LICENSE file in the root of the source
*  tree.
*/

// This code is adapted from
// https://rawgit.com/Miguelao/demos/master/mediarecorder.html

'use strict';

/* globals MediaRecorder */

var mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
var mediaRecorder;
var recordedBlobs;
var sourceBuffer;

var gumVideo = document.querySelector('video#gum');
var recordedVideo = document.querySelector('video#recorded');

var recordButton = document.querySelector('button#record');
var playButton = document.querySelector('button#play');
var downloadButton = document.querySelector('button#download');
recordButton.onclick = toggleRecording;
playButton.onclick = play;
downloadButton.onclick = download;

// window.isSecureContext could be used for Chrome
var isSecureOrigin = location.protocol === 'https:' ||
location.hostname === 'localhost';
if (!isSecureOrigin) {
  alert('getUserMedia() must be run from a secure origin: HTTPS or localhost.' +
    '\n\nChanging protocol to HTTPS');
  location.protocol = 'HTTPS';
}

var constraints = {
  audio: true,
  video: true
};

function handleSuccess(stream) {
  recordButton.disabled = false;
  console.log('getUserMedia() got stream: ', stream);
  window.stream = stream;
  if (window.URL) {
    gumVideo.src = window.URL.createObjectURL(stream);
  } else {
    gumVideo.src = stream;
  }
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

navigator.mediaDevices.getUserMedia(constraints).
    then(handleSuccess).catch(handleError);

function handleSourceOpen(event) {
  console.log('MediaSource opened');
  sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
  console.log('Source buffer: ', sourceBuffer);
}

recordedVideo.addEventListener('error', function(ev) {
  console.error('MediaRecording.recordedMedia.error()');
  alert('Your browser can not play\n\n' + recordedVideo.src
    + '\n\n media clip. event: ' + JSON.stringify(ev));
}, true);

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function handleStop(event) {
  console.log('Recorder stopped: ', event);
}

function toggleRecording() {
  if (recordButton.textContent === 'Starte deine 22 Sekunden') {
    startRecording();
  } else {
    stopRecording();
    recordButton.textContent = 'Starte deine 22 Sekunden';
    playButton.disabled = false;
    downloadButton.disabled = false;
  }
}

function count(restwert) {
if (restwert < 1) {document.getElementById('record').click();}
else {
document.getElementById("seconds").innerHTML = restwert;
setTimeout(function(){count(restwert-1)},1000);
}

}

function startRecording() {
count(22);
hideplayer();
  recordedBlobs = [];
  var options = {mimeType: 'video/webm;codecs=vp9'};
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    console.log(options.mimeType + ' is not Supported');
    options = {mimeType: 'video/webm;codecs=vp8'};
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.log(options.mimeType + ' is not Supported');
      options = {mimeType: 'video/webm'};
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log(options.mimeType + ' is not Supported');
        options = {mimeType: ''};
      }
    }
  }
  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e) {
    console.error('Exception while creating MediaRecorder: ' + e);
    alert('Exception while creating MediaRecorder: '
      + e + '. mimeType: ' + options.mimeType);
    return;
  }
  console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  recordButton.textContent = 'Stop';
  playButton.disabled = true;
  downloadButton.disabled = true;
  mediaRecorder.onstop = handleStop;
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start(10); // collect 10ms of data
  console.log('MediaRecorder started', mediaRecorder);
}

function stopRecording() {
    for(var i = 1; i<99999; i++){
	window.clearInterval(i);
    }

  mediaRecorder.stop();
  console.log('Recorded Blobs: ', recordedBlobs);
  recordedVideo.controls = true;
}

function hideplayer(){
document.getElementById("recorded").style.display = "none";
document.getElementById("gum").style.display = "block";
}

function showplayer(){
document.getElementById("recorded").style.display = "block";
document.getElementById("gum").style.display = "none";
}

function play() {
    showplayer();
  var superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
  recordedVideo.src = window.URL.createObjectURL(superBuffer);
 document.getElementById("recorded").style.display = "block";
    setTimeout(function(){hideplayer();},22000);
}

function closet() {
$('#login').hide();
$('#modul-container').fadeIn('slow');
}


function open() {
$('#login').fadeIn('slow');
$('#modul-container').hide();
}

function showloader(){
$('#loader').fadeIn('slow');
$('#modul-container').hide();
}

function hideloader(){
$('#loader').hide();
$('#modul-container').fadeIn('slow');
}

function login() {
    showloader();
    closet();
    var user = $('#user').val();
    var pass = $('#pass').val();
    $.ajax('https://22sekunden.at/wp-content/plugins/22sek-video/record/login.php', {
        		method: "POST",
        		data: "user=" + user + "&pass=" + pass,
        		success: function (data) {
				hideloader();
            			console.log(data);
				if(data == 0) {
				    alert("Falscher Benutzername oder falsches Passwort");
				    open();
				} else {
				    //closet();
				    download();
				}


        		},
        		error: function (data) {
				hideloader();
            			console.log(data);
				alert("Verbindunsfehler - try again later");
        		}
    		});


}

function download() {
  var blob = new Blob(recordedBlobs, {type: 'video/webm'});
  var url = window.URL.createObjectURL(blob);
    showloader();

	var filename = "test";
		var data = new FormData();

		data.append('file', blob);
    		//data.append('croppedImage', blob);
    		//data.append('form_key', window.FORM_KEY);
		$('#loader').show();
		$.ajax('https://22sekunden.at/wp-content/plugins/22sek-video/record/upload.php', {
        		method: "POST",
        		data: data,
        		processData: false,
        		contentType: false,
        		success: function (data) {
            			console.log(data);
				hideloader();
				if (data == 0) {
				    open();
				} else {
				    alert(data);
				}
        		},
        		error: function (data) {
				hideloader();
            			console.log(data);
				alert("Verbindunsfehler - try again later");
        		}
    		});





  var a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'test.webm';
  document.body.appendChild(a);
  //a.click();
  setTimeout(function() {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}
