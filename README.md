[Try it here](https://damdoy.github.io/procedural-electronic-schematic-generation/pcb_gen.html)

[Try it here (old version)](https://damdoy.github.io/procedural-electronic-schematic-generation/schematic_gen.html)

## Procedural electronic schematic generation

Little weekend project to try to replicate the visuals of a schematic or a PCB using  procedural generation methods.   
The goal was not to create something that has sense but just looks kind of real.

Here is basically how it works:
- Large chips are placed randomly on the board with their pins
- Pins are linked using a rudimentary A* algorithm
- Smaller chips are added with their pins, and the routing is applied again
- Repeat until single ended elements are placed

## Examples

new version, pcb:

![](examples/example1.png)

old version, schematic:

![](examples/example2.png)
