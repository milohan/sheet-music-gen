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
  	w param:(PIntRangeOrInt/PKeySignature/PSeed) w{
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

Alphanumeric = 
	chars: [a-z0-9]+{
    	return chars.join("");
    }

Letter = 
	("A"/"B"/"C"/"D"/"E"/"F"/"G")

KeySuffix =
	("minor"/"major"/"Minor"/"Major"/"Min"/"Maj"/"min"/"maj"/"m"/"M"/"")

Integer = 
	digits:[0-9]+ { 
		return parseInt(digits.join(""), 10); 
	}

IntegerRange = 
	first:Integer"-"second:Integer{ 
    	if (first > second){
        	error("Min value must be greater than max value");
        }
		return [first, second]; 
	}
   

_ "whitespace"
= [ \t\r]*

w "whitespaceNewLine"
= [ \t\n\r]*