# sheet-music-gen

This is a repository of a domain specific language (DSL) for the generation of random, but parameterized, sheet music.  It is a work in progress, but is usable in its current form.  There are two versions of the DSL, a "Graphical User Interface" (GUI) version and a "code" version.  The GUI version is simpler to use, but is slightly less flexible than the code version of the DSL.  Instructions on running and using both versions are below.

# GUI version

To run, open "dsl_gui.html" with your browser of choice (make sure your folder structure mirrors that of the repository's).  Set the parameters as you see fit, and hit "generate" to output sheet music.  Code (for the code version of the dsl) that corresponds to the parameter values you've set will also be generated and displayed.

### GUI display:

![input](https://raw.githubusercontent.com/milohan/sheet-music-gen/master/example_images/example_gui.png)

# Code version

To run, open "dsl_code.html" with your browser of choice (make sure your folder structure mirrors that of the repository's).  Type syntax into the text field or paste and edit code outputted from the GUI version.  Click "generate" to see the resulting sheet music.

### Syntax

- Use a colon to separate the name of the parameter and the value you're assigning to it (eg, "measures: 10"), and keep each parameter on a separate line.
- To create a stave, type "stavename { }", with all the stave's parameters inside the curly braces.
- Specify all *score parameters* and *global parameters* before creating any staves.
	- Score parameters are parameters that are always universal to the entire score, such as "measures."
	- Global parameters are parameters that will be used by default whenever they is not specified by a stave.  For example, if you want all your staves to be in bass clef, you can type "clef: bass" once as a global parameter instead of typing it in every stave.

### Example input and corresponding output:
![input](https://raw.githubusercontent.com/milohan/sheet-music-gen/master/example_images/code_input.png)
![output](https://raw.githubusercontent.com/milohan/sheet-music-gen/master/example_images/code_output.png)

### Parameters that are currently supported:

Parameter Name | Example Values | Description
--- | --- | --- 
measures | "10", "15-27"| # of measures of sheet music to generate  
key | "A", "Fm", "BMajor" | starting key signature
clef | "treble", "alto", "bass" | clef used for stave
absRange|"C3-G#6"| range of allowable pitches
polyphony|"1-4", "1, 2, 4", "3" |number of simultaneous notes
seed | "h3042s", "grEenbn0na" | seed used for procedural generation of score