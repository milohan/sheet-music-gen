# sheet-music-gen

To run, open "index.html" with your browser of choice.  Type syntax into the text field and click "generate" to see the output.
Use a colon to separate the name of the parameter and the value you're assigning to it (eg, "measures: 10"), and keep each parameter on a separate line.

### Parameters that are currently supported:

Parameter Name | Example Values | Description
--- | --- | --- 
measures | "10", "15-27"| # of measures of sheet music to generate  
key | "A", "Fm", "BMajor" | starting key signature
clef | "treble", "alto", "bass" | clef used for stave
seed | "h3042s", "grEenbn0na" | seed used for procedural generation of score