ParameterList = 
    params:Parameter* {
        var paramList = {};
        
        //merge params (a list of objects) into a single object
        for (var i = 0; i < params.length; i++) {
            for (var key in params[i]) {
                paramList[key] = params[i][key];
             }
        }
        return paramList;
    }

Parameter = 
    w param:(PIntRangeOrInt/PKeySignature/PSeed/PSciNoteRange/PClef) w{
        return param;
    }

//all parameters that expect an integer range or an integer
PIntRangeOrInt  =
    param:("measures") _ ":" _ value:(IntegerRange/Integer){
        var par;
        if (param == "measures"){
            return {numMeasures: value};
        }
    }
    
PClef = 
    param:"clef" _ ":" _ value: Clef {
        return {clef: value};
    }

//all parameters that expect a time signature
PKeySignature = 
    param:("key") _ ":" _ value:Letter (" "/"") suffix:KeySuffix {
        if (param == "key"){
            return {key: value+suffix};
        }
    }
    
//seed
PSeed = 
    "seed" _ ":" _ value:Alphanumeric {
        return {seed: value};
    }

//sci note
PSciNoteRange = 
    "absRange" _ ":" _ value:SciNoteRange {
        return {absRange: value};
    }

Alphanumeric = 
    chars: [a-z0-9]+{
        return chars.join("");
    }

Letter = 
    ("A"/"B"/"C"/"D"/"E"/"F"/"G")

KeySuffix =
    ("minor"/"major"/"Minor"/"Major"/"Min"/"Maj"/"min"/"maj"/"m"/"M"/"")

Clef = 
    ("treble"/"bass"/"tenor"/"alto")

Integer = 
    digits:[0-9]+ { 
        return parseInt(digits.join(""), 10); 
    }

IntegerRange = 
    first:Integer _ "-" _ second:Integer{ 
        if (first > second){
            error("Min value must be greater than max value");
        }
        return [first, second]; 
    }

SciNoteRange = 
    first:SciNote _ "-" _ second:SciNote{
        if (first > second){
            error("Min note must be lower than max note");
        }
        return [first, second];
    }

//a note with an octave -> MIDI #
SciNote = 
    letter:LetterToInt symbols:SharpsFlatsToInt octave:Octave {
        return (octave + 1)* 12 + letter + symbols;
    }
    
//returns a positive or negative integer.  ## -> +2, bbb -> -3
SharpsFlatsToInt = 
    symbols: (FlatsAndSharps / Flats / Sharps / "") {
        if (symbols[0] == '#'){
            return symbols.length;
        }
        return -symbols.length;
    }

//one or more sharps
Sharps = 
    "#"+

//one or more flats
Flats = 
    "b"+
    
//matches a string that has at least one sharp and one flat - currently used just for checking errors
FlatsAndSharps = 
    (("b" ("b")* "#" ("b"/"#")*) / ("#" ("#")* "b" ("b"/"#")*)) {
        error("Error: Found sharps and flats within the same note");
    }
    

//converts note letter to int
LetterToInt =
    letter:Letter {
        if (letter == "C") return 0;
        if (letter =="D") return 2;
        if (letter =="E") return 4;
        if (letter =="F") return 5;
        if (letter == "G") return 7;
        if (letter =="A") return 9;
        if (letter =="B") return 11;
    }

//an int between 0 and 8
Octave = 
    octave: Integer {
        if (octave > 8 || octave < 0){
            error("octave must be an integer between 0 and 8");
        }
        return octave
    }

_ "whitespace"
= [ \t\r]*

w "whitespaceNewLine"
= [ \t\n\r]*