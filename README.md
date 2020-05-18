# Introduction

The goal of this project was to simulate Tomasulo's Algorithm for out-of-order execution on the browser. We have been able to simulate operations for basic operations such as ADD, SUB, DIV, etc. Branch instruction has been supported. However, at the point of writing this document, branch instructions have an issue and we are trying to fix the bug. The simulation can be run on the browser and you can find it live [here](https://rinz13r.github.io/tomasulo-simulation/).

# Implementation
In Tomasulo's Algorithm, the following hardware structures are present (Not specific to any microarchitecture):
- Instruction Queue
- Reorder Buffer
- Register Allocation Tables
- Reservation Stations
- Functional Units

In our implemention, we have objects corresponding to each of the above hardware structures.

## Some details on the implemention
- RS ([js/core/RS.js](https://github.com/rinz13r/tomasulo-simulation/tree/master/js/core/RS.js)): Represents a reservation station. The decoded instructions come sit here.
This structure embeds multiple [RS_Element]s each of which correspond to a certain operation supported (ADD, DIV, BEQ, etc.)
- ROB ([js/core/ROB.js](https://github.com/rinz13r/tomasulo-simulation/tree/master/js/core/ROB.js)): Represents a Reorder Buffer. Has a [start] and [end] member to track entries.
