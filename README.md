# sheet-music-gen

To run, open "index.html" with your browser of choice.  Type into the text field and click "generate" to see the output.

### Syntax

- Use a colon to separate the name of the parameter and the value you're assigning to it (eg, "measures: 10"), and keep each parameter on a separate line.
- To create a stave, type "stavename { }", with all the stave's parameters inside the curly braces.
- Specify all *score parameters* and *global parameters* before creating any staves.
	- Score parameters are parameters that are always universal to the entire score, such as "measures."
	- Global parameters are parameters that will be used by default whenever it is not specified by a stave.  For example, if you want all your staves to be in bass clef, you can type "clef: bass" once as a global parameter instead of typing it in every stave.

### Example input and corresponding output:
![input](https://raw.githubusercontent.com/milohan/sheet-music-gen/master/images/example_input_annotated.png)
![output](https://raw.githubusercontent.com/milohan/sheet-music-gen/master/images/example_output.png)

### Parameters that are currently supported:

Parameter Name | Example Values | Description
--- | --- | --- 
measures | "10", "15-27"| # of measures of sheet music to generate  
key | "A", "Fm", "BMajor" | starting key signature
clef | "treble", "alto", "bass" | clef used for stave
absRange|"C3-G#6"| range of allowable pitches
polyphony|"1-4", "1, 2, 4", "3" |number of simultaneous notes
seed | "h3042s", "grEenbn0na" | seed used for procedural generation of score