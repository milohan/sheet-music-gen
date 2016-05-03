//constants
var OCTAVE = 12;
var MEASURE_LENGTH_PADDING = 2;
var TIME_NUMERATOR = 4;  //will eventually be controlled by a parameter
var TIME_DENOMINATOR = 4;
var MAX_LINE_LENGTH = 25;

//note letter to semi-tone conversion
var letterVals = {
    "C": 0,
    "D": 2,
    "E": 4,
    "F": 5,
    "G": 7,
    "A": 9,
    "B": 11
};

//ABC notation for all notes (using sharps)
var notesSharps = ["C", "^C", 'D', '^D', 'E', "F", "^F", "G", "^G", "A", "^A", "B"];
//ABC notation for all notes (using flats)
var notesFlats = ["C", "_D", 'D', '_E', 'E', "F", "_G", "G", "_A", "A", "_B", "B"];
//Scientific pitch notation for all notes (using sharps)
var notesSci = ["C", "C#", 'D', 'D#', 'E', "F", "F#", "G", "G#", "A", "A#", "B"];


    //returns a random number between 0 and bound.
    function randInt(bound) {
        return Math.floor(Math.random() * (bound));
    }

    //pre: note is a string of the format "LETTER (A-G) + (#* OR b*) + NUMBER (0-8)," eg C#4 or D2.
    //convert from scientific pitch notation to MIDI pitch value
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

    //if parse failse, returns an object with:
    //success: false
    //abc: error object
    //seed: null
    //
    //if parse succeeds, returns an object with
    //success: true
    //abc: abc string
    //seed: seed used
    function codeToABC(string){
        var staves = [];
        try {
            staves = parser.parse(string);
        }
        catch(err) {
            console.log(err);
            return {
                "success": false, 
                "abc": err,
                "seed": null
            };        
        }

        //reseed
        Math.seedrandom();
        var seed = Math.random().toString(36).substring(7, 12); //get random string for seed
        if (staves[0].seed != null){
            seed = staves[0].seed;
        }
        Math.seedrandom(seed);

        defaults(staves);
        applyGlobals(staves);

        var abc = genABC(staves);

        return {
            "success": true, 
            "abc": abc,
            "seed": seed
        };
    }

    //put this after parse and just check for null
    function defaults(staves){

        if (staves[0].clef == null){
            staves[0].clef = "treble";
        }

        if (staves[0].key == null){
            staves[0].key = "C";
        }
        if (staves[0].numMeasures == null){
            staves[0].numMeasures = [10, 20];
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
            if (staves[i].numMeasures == null){
                staves[i].numMeasures = staves[0].numMeasures;
            }
            if (staves[i].absRange == null){
                staves[i].absRange = staves[0].absRange;
            }
            if (staves[i].polyphony == null){
                staves[i].polyphony = staves[0].polyphony;
            }
        }
    }

    //returns a string of ABC notation based off the parameters in the 'staves' array.
    function genABC(staves){

        //apply score parameters
        var genString ="M: " + TIME_NUMERATOR + "/" + TIME_DENOMINATOR + "\n";
        genString = genString + "L: 1/4 \n"
        genString = genString + "K: " + staves[0].key + " " + staves[0].clef + "\n"

        var measures = randInt(staves[0].numMeasures[1] - staves[0].numMeasures[0] + 1) + staves[0].numMeasures[0];
        
        //generate each stave one-by-one
        for (var i = 1; i < staves.length; i++) {
            var clef = staves[i].clef;
            genString = genString + "[V: " + i + " clef: " + clef + "] ";
            genString = genString + genStave(staves[i], measures) + "\n";
            console.log(genString);
        }

        //get rid of any double newlines
        genString.replace(/[\n\n]{2,}/g, "\n");

        return genString;
    }

    //generates 'measures' measures of music based on the parameters in 'stave'
    function genStave(stave, measures){
        var genString = "";
        var curLineLength = 0; //current number of notes in line (to keep track of when to start new line)
        var m = measures;
        while (m > 0){
            var measure = genMeasure(stave);
            m--;
            genString = genString + measure.measureString;
            curLineLength += measure.numNotes;

            //start new line if we're past MAX_LINE_LENGTH, but only if we have some measures left.
            if (curLineLength >= MAX_LINE_LENGTH && m > 0){
                curLineLength = 0;
                genString = genString + "\n";
            }
        }
        return genString;
    }

    //returns an object that wraps two elements: measureString, numNotes
    function genMeasure(stave){

    	var measureString = "";
    	var n = 4;
    	var numNotes = 0;
    	while (n > 0){
    		n--;
    		measureString = measureString + " " + genRandomNote(stave, getPoly(stave));
    		numNotes++;  //increment numNotes every time we add a note.
    	}
    	measureString = measureString + " |";
    	numNotes += MEASURE_LENGTH_PADDING;
    	return {
    		measureString: measureString, 
    		numNotes: numNotes
    	}
    }

    //generates random note with 'poly' pitches, all within abs pitch range.
    function genRandomNote(stave, poly){
        var noteString = "[";

        //stores midi representation of notes
        var notes = [];

        var absMinPitch, absMaxPitch;
        absMinPitch = stave.absRange[0];
        absMaxPitch = stave.absRange[1];
        
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
    function getPoly(stave){

        return stave.polyphony[randInt(stave.polyphony.length)];

    }
