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
    var name = document.getElementById("name").value.replace(" ", "_");
    if (name == "") {
        alert("Please enter your name.");
        return false;
    }
    var set_num = "0"
    var number = document.getElementsByName("set");
    for (var i = 0; i < number.length; i++) {
        if (number[i].checked) {
            set_num = number[i].value;
        }
    }
    if (set_num == "0") {
        alert("Please press the setlist number button.");
        return false;
    }

    // convert display
    Display();

    // directories for methods
    var methods = [];
    methods.push(wav_dir + "mel_db_noise_over_3/");
    methods.push(wav_dir + "mel_db_insert/");
    methods.push(wav_dir + "mel_db_noise_concat/");
    methods.push(wav_dir + "mel_db_ori/");
    methods.push(wav_dir + "mel_db_noise_new_concat/");
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
    // var number = document.getElementById("number").value
    file_list = makeFileList(methods, set_num).slice(0, 1);
    outfile = name + "_" + "set" + set_num + ".csv";
    nat_scores = (new Array(file_list.length)).fill(0);
    flu_scores = (new Array(file_list.length)).fill(0);
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
// function makeFileList(methods, rands) {
//     var files = new Array();
//     var names = loadText(wavnames);
//     for (var i = 0; i < methods.length; i++) {
//         for (var j = 0; j < rands.length; j++) {
//             files.push(methods[i] + names[rands[j]] + ".wav");
//         }
//     }
//     files.shuffle();
//     return files;
// }

function makeFileList(methods, which_set) {
    var files = new Array();
    if (which_set == "1"){
        var names = loadText(wavnames_a);
    }
    if (which_set == "2"){
        var names = loadText(wavnames_b);
    } 
    for (var i = 0; i < methods.length; i++) {
        for (var j = 0; j < names.length; j++) {
            files.push(methods[i] + names[j] + ".wav");
        }
    }
    files.shuffle();
    return files;
}

function setAudio() {
    document.getElementById("page").textContent = `Page ${page + 1} / ${nat_scores.length / n_per_page}`;
    for (var i = 0; i < n_per_page; i++) {
        // set audio
        document.getElementById("audio" + String(i)).innerHTML = `${i + 1}.<br>`
            + `<audio src="${file_list[page * n_per_page + i]}"`
            + ' controls preload="auto">'
            + '</audio>';

        // initialize selected option using scores
        var natselected = (new Array(6)).fill('');
        for (var j = 0; j < 6; j++) {
            if (nat_scores[page * n_per_page + i] == String(j)) {
                natselected[j] = " natselected";
                break;
            }
        }
        var fluselected = (new Array(6)).fill('');
        for (var j = 0; j < 6; j++) {
            if (flu_scores[page * n_per_page + i] == String(j)) {
                fluselected[j] = " fluselected";
                break;
            }
        }
        
        document.getElementById("fluselect" + String(i)).innerHTML = `<h4>Fluency(流暢性) </h4>`
            + `<select id="flu${i}`
            + `" onchange="evaluation(${i})">`
            + `<option value="0"${fluselected[0]}>Please Select</option>`
            + `<option value="5"${fluselected[5]}>Excellent(とても流暢)</option>`
            + `<option value="4"${fluselected[4]}>Good(流暢)</option>`
            + `<option value="3"${fluselected[3]}>Fair(どちらともいえない)</option>`
            + `<option value="2"${fluselected[2]}>Poor(やや流暢さを欠いた)</option>`
            + `<option value="1"${fluselected[1]}>Bad(流暢じゃない)</option>`
            + '</select>';
        document.getElementById("natselect" + String(i)).innerHTML = `<h4>Naturality(自然性) </h4>`
            +`<select id="nat${i}`
            + `" onchange="evaluation(${i})">`
            + `<option value="0"${natselected[0]}><font color=red>Please Select</font></option>`
            + `<option value="5"${natselected[5]}>Excellent(未編集)</option>`
            + `<option value="4"${natselected[4]}>Good(未編集に近い)</option>`
            + `<option value="3"${natselected[3]}>Fair(どちらともいえない)</option>`
            + `<option value="2"${natselected[2]}>Poor(やや編集された感じ)</option>`
            + `<option value="1"${natselected[1]}>Bad(編集されたと思う)</option>`
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
    if (page == nat_scores.length / n_per_page - 1 && page == flu_scores.length / n_per_page - 1) {
        document.getElementById("next").disabled = true;
    } else {
        document.getElementById("next").disabled = false;
        for (var i = 0; i < n_per_page; i++) {
            if (document.getElementById(`nat${i}`).value == "0" || document.getElementById(`flu${i}`).value == "0" ) {
                document.getElementById("next").disabled = true;
                break;
            }
        }
    }
    // finish button
    for (var i = 0; i < file_list.length; i++) {
        document.getElementById("finish").disabled = false;
        if (nat_scores[i] == "0") {
            document.getElementById("finish").disabled = true;
            break;
        }
        if (flu_scores[i] == "0") {
            document.getElementById("finish").disabled = true;
            break;
        }
    }
}

function evaluation(i) {
    if (nat_scores[n_per_page * page + i] == "0") {
        nat_scores[page * n_per_page + i] = document.getElementById(`nat${i}`).value;
    }
    if (flu_scores[n_per_page * page + i] == "0") {
        flu_scores[page * n_per_page + i] = document.getElementById(`flu${i}`).value;
    }
    setButton();
}

function exportCSV() {
    var csvData = "";
    csvData+="Utt, Method, Nat, Flu\r\n"
    for (var i = 0; i < file_list.length; i++) {
        
        csvData += file_list[i] + "," + file_list[i].split('/')[1] + ", "
            + nat_scores[i] + "," + flu_scores[i] + "\r\n";
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
const wavnames_a = "wav/wavnames1.txt"
const wavnames_b = "wav/wavnames2.txt"
const n_utt = 1;

// invalid enter key
document.onkeypress = invalid_enter();

// global variables
var outfile;
var file_list;
var nat_scores;
var flu_scores;
var page;
var n_per_page;
