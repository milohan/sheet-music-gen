
var OCTAVE = 12;
var MEASURE_LENGTH_PADDING = 2;
var seed;
var timeNumerator = 4;
var timeDenominator = 4;
var clef = "treble";
var measures = 0;
var lineLength = 25;
var startKey = 'C';
var noteLengths = ['q'];

var letterVals = {
    "C": 0,
    "D": 2,
    "E": 4,
    "F": 5,
    "G": 7,
    "A": 9,
    "B": 11
};

var notesSharps = ["C", "^C", 'D', '^D', 'E', "F", "^F", "G", "^G", "A", "^A", "B"];
var notesFlats = ["C", "_D", 'D', '_E', 'E', "F", "_G", "G", "_A", "A", "_B", "B"];
var notesSci = ["C", "C#", 'D', 'D#', 'E', "F", "F#", "G", "G#", "A", "A#", "B"];


    //var keys = ['A','B','C','D','E','F','G'];

    //returns a random number between 0 and bound.
    function randInt(bound) {
        return Math.floor(Math.random() * (bound));
    }

    //@pre: note is a string of the format "LETTER (A-G) + (#* OR b*) + NUMBER (0-8)," eg C#4 or D2.
    function sciToMidi(note){
        var letter = note.charAt(0).toUpperCase();
        var octave = parseInt(note.charAt(note.length-1));
        var symbols = note.substring(1, note.length-1);

        var midi = 0;
        midi = (octave + 1) * OCTAVE + letterVals[letter];

        //assumes that we have only sharps OR only flats in 'symbols' (never both sharps and flats).
        if (symbols.length > 0){

            //add 1 for every sharp
            if (symbols.charAt(0) == '#') {
                midi = midi + symbols.length;
            }

            //subtract 1 for every flat
            else if (symbols.charAt(0) == 'b'){
                midi = midi - symbols.length;
            }
        }
        return midi;
    }

   //converts midi value of note pitch (int from 0 to 127) to corresponding scientific pitch notation
    function midiToSci(midi){

        return ("" + notesSci[midi % 12] + Math.floor((midi-12)/12));
    }

    //converts midi value of note pitch (int from 0 to 127) to corresponding ABC representation
    function midiToAbc(midi){
        var abcString;
        if (randInt(2) == 0) {
            abcString = notesSharps[midi % 12];
        }
        else {
            abcString = notesFlats[midi%12];
        }
        var octave = Math.floor((midi-60)/12);

        var symbol;
        if (octave > 0){
            symbol = "'"; //higher than middle C octave
        }
        else {
            symbol = ","; //lower or equal to middle C octave
        }
        
        octave = Math.abs(octave);
        
        while (octave > 0){
            octave--;
            abcString = abcString + symbol;
        }

        return abcString;
    }

    //generates and renders piece based on current parameters
    function generate(){
        
        reset();
        var abcString = codeToABC($('textarea#input').val());
        if (abcString[0]){
           ABCJS.renderAbc('notation', abcString[1]);
        }
        else {
            var err = abcString[1];
            $("#error").html(err.name + ": " + err.message);
        }
    }

    //returns array of [boolean, obj]
    //boolean is true/false depending on success of parse
    //obj is a string of ABC if success, error object if failure
    function codeToABC(string){
        var staves = [];
        try {
            staves = parser.parse(string);
        }
        catch(err) {
            console.log(err);
            return [false, err];
        }

        defaults(staves);
        applyGlobals(staves);

        return [true, genABC(staves)];
    }

    function reset(){
        //clear out prev sheet music
        $("#notation").html("");

        //clear out any error messages
        $("#error").html("");
    }

    //put this after parse and just check for null
    function defaults(staves){

        if (staves[0].clef == null){
            staves[0].clef = "treble";
        }

        if (staves[0].key == null){
            staves[0].key = "C";
        }

        if (staves[0].measures == null){
            staves[0].measures = [10, 20];
        }

        if (staves[0].absRange == null){
            staves[0].absRange = [sciToMidi("G3"), sciToMidi("C6")];
        }

        if (staves[0].polyphony == null){
            staves[0].polyphony = [1,2,3];
        }
    }

    //applies global parameters where needed
    function applyGlobals(staves){
        for (var i = 1; i < staves.length; i++){
            if (staves[i].clef == null){
                staves[i].clef = staves[0].clef;
            }
            if (staves[i].key == null){
                staves[i].key = staves[0].key;
            }
            if (staves[i].measure == null){
                staves[i].measure = staves[0].measure;
            }
            if (staves[i].absRange == null){
                staves[i].absRange = staves[0].absRange;
            }
            if (staves[i].polyphony == null){
                staves[i].polyphony = staves[0].polyphony;
            }
        }
    }

    function genABC(staves){
        var genString ="M: " + timeNumerator + "/" + timeDenominator + "\n";
        genString = genString + "L: 1/4 \n"
        genString = genString + "K: " + staves[0].key + " " + staves[0].clef + "\n"

        measures = randInt(staves[0].numMeasures[1] - staves[0].numMeasures[0] + 1) + staves[0].numMeasures[0];
        for (var i = 1; i < staves.length; i++) {
            var clef = staves[i].clef;
            genString = genString + "[V: " + i + " clef: " + clef + "] ";
            genString = genString + genStave(i, staves) + "\n";
            console.log(genString);
        }

        genString.replace(/[\n\n]{2,}/g, "\n");

        return genString;
    }

    function genStave(stave, staves){
        var genString = "";
        var curLineLength = 0; //current number of notes in line (to keep track of when to start new line)
        var m = measures;
        while (m > 0){
            var measure = genMeasure(stave, staves);
            m--;
            genString = genString + measure.measureString;
            curLineLength += measure.numNotes;

            //start new line if we're past lineLength, but only if we have some measures left.
            if (curLineLength >= lineLength && m > 0){
                curLineLength = 0;
                genString = genString + "\n";
            }
        }
        return genString;
    }

    //returns an object that wraps two elements: measureString, numNotes
    function genMeasure(stave, staves){

    	var measureString = "";
    	var n = 4;
    	var numNotes = 0;
    	while (n > 0){
    		n--;
    		measureString = measureString + " " + genRandomNote(stave, getPoly(stave, staves), staves);
    		numNotes++;  //increment numNotes every time we add a note.
    	}
    	measureString = measureString + " |";
    	numNotes += MEASURE_LENGTH_PADDING;
    	return {
    		measureString: measureString, 
    		numNotes: numNotes
    	}
    }

    //TODO: potential infinite loop if user enters SMALL abs pitch range and LARGE poly.
    //generates random note with 'poly' pitches, all within abs pitch range.
    function genRandomNote(stave, poly, staves){
        var noteString = "[";

        //stores midi representation of notes
        var notes = [];

        var absMinPitch, absMaxPitch;
        absMinPitch = staves[stave].absRange[0];
        absMaxPitch = staves[stave].absRange[1];
        
        //add notes 'poly' times
        while (poly > 0){
            poly--;
            
            //loop until we find a note that isn't in note array yet
            var posNote = randInt(absMaxPitch - absMinPitch + 1) + absMinPitch;
            while (notes.indexOf(posNote) > -1){
                posNote = randInt(absMaxPitch - absMinPitch + 1) + absMinPitch;
            }
            notes[notes.length] = posNote;
        }

        //create string from midi notes in 'note' array
        for (var i = 0; i < notes.length; i++){
            noteString = noteString + midiToAbc(notes[i]);
        }
        noteString = noteString + "]";
        return noteString;
    }

    //returns a random possible poly amount (num of notes in chord)
    //order of precedence - stave poss, stave max/min, global poss, global max/min
    function getPoly(stave, staves){

        return staves[stave].polyphony[randInt(staves[stave].polyphony.length)];

    }