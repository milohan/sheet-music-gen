Start = 
  	w param:ParamObj _ ":" _ value:Value w{

		//set attribute of given parameter to given value
		for (var attrname in param) {
        	param[attrname] = value; 
        }
 		return param;
  	}

ParamObj =
	"measures" {
		return {numMeasures: 0};
	}

Value = 
	digits:[0-9]+ { 
		return parseInt(digits.join(""), 10); 
	}


_ "whitespace"
= [ \t\r]*

w "whitespaceNewLine"
= [ \t\n\r]*