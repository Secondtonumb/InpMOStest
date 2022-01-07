Array.prototype.shuffle = function () {
    var i = this.length;
    while (i) {
        var j = Math.floor(Math.random() * i);
        var t = this[--i];
        this[i] = this[j];
        this[j] = t;
    }
    return this;
}

// invalid enter key
function invalid_enter() {
    if (window.event.keyCode == 13) {
        return false;
    }
}

const pickN = (min, max, n) => {
    const list = new Array(max - min + 1).fill().map((_, i) => i + min);
    const ret = [];
    while (n--) {
        const rand = Math.floor(Math.random() * (list.length + 1)) - 1;
        ret.push(...list.splice(rand, 1))
    }
    return ret;
}

// start experiment
function start_experiment() {
    // get user name
    // var name = document.getElementById("name").value.replace(" ", "_");
    // if (name == "") {
    //     alert("Please enter your name.");
    //     return false;
    // }

    // convert display
    Display();

    // directories for methods
    var methods = [];
    methods.push(wav_dir + "set1/");
    // methods.push(wav_dir + "method2/");
    // methods.push(wav_dir + "method3/");
    // methods.push(wav_dir + "method4/");
    // methods.push(wav_dir + "method5/");
    // methods.push(wav_dir + "method6/");
    // methods.push(wav_dir + "method7/");

    // number of samples displayed per page
    n_per_page = 5;

    // pick up samples randomly
    var rands = pickN(0, n_utt - 1, n_per_page * 2);
    file_list = makeFileList(methods, rands);
    outfile = "result.csv";
    scores = (new Array(file_list.length)).fill(0);
    init();
}

// convert display
function Display() {
    document.getElementById("Display1").style.display = "none";
    document.getElementById("Display2").style.display = "block";
    // document.getElementById("Display3").style.display = "none";
}

// load text file
function loadText(filename) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", filename, false);
    xhr.send(null);
    var list = xhr.responseText.split(/\r\n|\r|\n/);
    list.pop();

    return list;
}

// make file list
function makeFileList(methods, rands) {
    var files = new Array();
    var names = loadText(wavnames);
    for (var i = 0; i < methods.length; i++) {
        for (var j = 0; j < rands.length; j++) {
            files.push(methods[i] + names[rands[j]] + ".wav");
        }
    }
    files.shuffle();
    return files;
}

function setAudio() {
    document.getElementById("page").textContent = `Page ${page + 1} / ${scores.length / n_per_page}`;
    for (var i = 0; i < n_per_page; i++) {
        // set audio
        document.getElementById("audio" + String(i)).innerHTML = `${i + 1}.<br>`
            + `<audio src="${file_list[page * n_per_page + i]}"`
            + ' controls preload="auto">'
            + '</audio>';

        // initialize selected option using scores
        var selected = (new Array(6)).fill('');
        for (var j = 0; j < 6; j++) {
            if (scores[page * n_per_page + i] == String(j)) {
                selected[j] = " selected";
                break;
            }
        }
        document.getElementById("select" + String(i)).innerHTML = `<select id="eval${i}`
            + `" onchange="evaluation(${i})">`
            + `<option value="0"${selected[0]}></option>`
            + `<option value="5"${selected[5]}>Excellent</option>`
            + `<option value="4"${selected[4]}>Good</option>`
            + `<option value="3"${selected[3]}>Fair</option>`
            + `<option value="2"${selected[2]}>Poor</option>`
            + `<option value="1"${selected[1]}>Bad</option>`
            + '</select>';
    }
}

function init() {
    page = 0;
    setAudio();
    setButton();
}

function setButton() {
    // prev button
    if (page == 0) {
        document.getElementById("prev").disabled = true;
    }
    else {
        document.getElementById("prev").disabled = false;
    }
    // next button
    if (page == scores.length / n_per_page - 1) {
        document.getElementById("next").disabled = true;
    } else {
        document.getElementById("next").disabled = false;
        for (var i = 0; i < n_per_page; i++) {
            if (document.getElementById(`eval${i}`).value == "0") {
                document.getElementById("next").disabled = true;
                break;
            }
        }
    }
    // finish button
    for (var i = 0; i < file_list.length; i++) {
        document.getElementById("finish").disabled = false;
        if (scores[i] == "0") {
            document.getElementById("finish").disabled = true;
            break;
        }
    }
}

function evaluation(i) {
    if (scores[n_per_page * page + i] == "0") {
        scores[page * n_per_page + i] = document.getElementById(`eval${i}`).value;
    }
    setButton();
}

function exportCSV() {
    var csvData = "";

    for (var i = 0; i < file_list.length; i++) {
        csvData += file_list[i] + ","
            + scores[i] + "\r\n";
    }

    const link = document.createElement("a");
    document.body.appendChild(link);
    link.style = "display:none";
    const blob = new Blob([csvData], { type: "octet/stream" });
    const url = window.URL.createObjectURL(blob);
    link.href = url;
    link.download = outfile;
    link.click();
    window.URL.revokeObjectURL(url);
    link.parentNode.removeChild(link);
}

function next() {
    page++;
    setAudio();
    setButton();
}

function prev() {
    page--;
    setAudio();
    setButton();
}

function finish() {
    exportCSV();
}


// directory name
const wav_dir = "wav/";
const wavnames = "wav/wavnames.txt"
const n_utt = 5;

// invalid enter key
document.onkeypress = invalid_enter();

// global variables
var outfile;
var file_list;
var scores;
var page;
var n_per_page;