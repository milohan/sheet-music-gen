Program = 
    (GlobalsAndStaves/StaveList/GlobalsOnly)

GlobalsAndStaves = 
    global:ParameterList staves:StaveList {
        staves.unshift(global);
        return staves;
    }
    
//used for error checking - user entered global params without defining stave
GlobalsOnly = 
    ParameterList {
        error("Missing Stave Definition");
    }

//must start with stave
StaveList = 
    staves:((Stave/StaveWithoutEndBracket) (Stave/StaveWithoutEndBracket/ImproperlyPlacedParameter)*) {
        var stavesList = [].concat.apply([], staves);
        
        return stavesList;
    }

Stave = 
    w name:StaveName _ "{" w params:ParameterList w "}" w {
        params.name = name;
        return params;
    }
    
StaveWithoutEndBracket = 
    w StaveName _ "{" w params:ParameterList w {
        error("missing closing curly brace");
    }

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

Parameter "Parameter" = 
    w param:(PIntRangeOrInt/PKeySignature/PSeed/PSciNoteRange/PClef/PIntListOrRangeOrInt/InvalidParameter/MissingValue/MissingColon) w{
        return param;
    }
    
//error copy of Parameter
ImproperlyPlacedParameter "Parameter" = 
    w param:(PIntRangeOrInt/PKeySignature/PSeed/PSciNoteRange/PClef/PIntListOrRangeOrInt/InvalidParameter/MissingValue/MissingColon) w{
        error("Global parameters must be placed before stave definitions");
    }
    
InvalidParameter =
    string: Alphanumeric _ ":" _ Alphanumeric {
        error(string + " is not a valid parameter");
    }
    
MissingValue = 
    string: Alphanumeric _ ":" _ {
        error("missing value");
    }
    
MissingColon = 
    string: Alphanumeric _ !"{"{
        error("missing colon");
    }

//all parameters that expect an integer range or an integer
//always outputs an array of two elements - min and max
PIntRangeOrInt  =
    param:("measures") _ ":" _ value:(IntegerRange/Integer/InvalidParameterValue) (_ InvalidParameterValue / ""){
        
        //ensure that we return an array
        if (value.constructor != Array){
            value = [value, value];
        }
        
        if (param == "measures"){
            return {numMeasures: value};
        }
    }

//always outputs a list (array) of ALL possible elements (not just min and max)
PIntListOrRangeOrInt = 
    param:("polyphony") _ ":" _ value:(IntegerList/IntegerRange/Integer/InvalidParameterValue) (_ InvalidParameterValue / ""){
    
        if (value.constructor === Array) {
            //integer range
            if (value[0] == "list") {
                value.splice(0,1);
            }
            //list
            else {
                var max= Math.max(value[0], value[1]);
                var min = Math.min(value[0], value[1]);
                value = [];
                for (var i = min; i <= max; i++){
                    value.push(i);
                }
            }
        }
        //integer
        else {
            value = [value];
        }
        
        if (param == "polyphony"){
            return {polyphony: value};
        }
    }
    
PClef = 
    param:"clef" _ ":" _ value: (Clef/InvalidParameterValue) (_ InvalidParameterValue / "") {
        return {clef: value};
    }

//all parameters that expect a time signature
PKeySignature = 
    param:("key") _ ":" _ value:(Key/InvalidParameterValue) (_ InvalidParameterValue / "") {
        if (param == "key"){
            return {key: value};
        }
    }
   
//seed
PSeed = 
    "seed" _ ":" _ value:(Alphanumeric/InvalidParameterValue) (_ InvalidParameterValue / "") {
        return {seed: value};
    }

//sci note
PSciNoteRange = 
    "absRange" _ ":" _ value:(SciNoteRange/InvalidParameterValue) (_ InvalidParameterValue / "") {
        return {absRange: value};
    }

Alphanumeric "String" = 
    chars: [A-Za-z0-9]+{
        return chars.join("");
    }
    
InvalidParameterValue =
    [a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};""'':\\|,.<>\/?]+{
        error("Invalid parameter value");
    }

Key = 
    value:Letter (" "/"") symbol:("#"/"b"/"") (" "/"") suffix:KeySuffix{
        return value+symbol+suffix;
    }
    

StaveName "Stave" = 
    chars: [A-Za-z0-9]+{
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
    
//two or more integers, separated by comma
IntegerList = first: Integer rest:(IntegerListPiece)+ {
        rest.push(first);
        rest.unshift("list");
        return rest;
    }

IntegerListPiece = 
    _","_ int:Integer {
        return int;
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