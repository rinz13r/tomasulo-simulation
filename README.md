# Introduction

The goal of this project was to simulate Tomasulo's Algorithm for out-of-order execution on the browser. We have been able to simulate operations for basic operations such as ADD, SUB, DIV, etc. Branch instruction has been supported. However, at the point of writing this document, branch instructions have an issue and we are trying to fix the bug. The simulation can be run on the browser and you can find it live [here](https://rinz13r.github.io/tomasulo-simulation/).

# Implementation
In Tomasulo's Algorithm, the following hardware structures are present (Not specific to any micro architecture):
- Instruction Queue
- Reorder Buffer
- Register Allocation Tables
- Reservation Stations
- Functional Units

In our implementation, we have objects corresponding to each of the above hardware structures.

## Some details on the implementing
- RS ([js/core/RS.js](https://github.com/rinz13r/tomasulo-simulation/tree/master/js/core/RS.js)): Represents a reservation station. The decoded instructions come sit here.
This structure embeds multiple [RS_Element]s each of which correspond to a certain operation supported (ADD, DIV, BEQ, etc.)
- ROB ([js/core/ROB.js](https://github.com/rinz13r/tomasulo-simulation/tree/master/js/core/ROB.js)): Represents a Reorder Buffer. Has a [start] and [end] member to track entries.
- FS ([js/core/FU.js](https://github.com/rinz13r/tomasulo-simulation/tree/master/js/core/FU.js)): Represents a functional unit. When the operands of the instruction in the RS are ready, the instruction is moved to functional unit. This structure embeds multiple [FS_Element]s each of which correspond to a certain operand supported (ADD, DIV etc). In these elements, the instruction is executed.
- RAT ([js/core/RAT.js](https://github.com/rinz13r/tomasulo-simulation/tree/master/js/core/FU.js)): Represents a Register Allocation table. Embeds a Register file which contains the processor's registers i.e physical registers. It also keeps tracks of renamed registers.

# Current Instructions supported

Currently ADD, SUB, MUL, DIV are supported. We are working on adding support for Branch and Load/store instructions.

# Instructions to run the simulation:

1. To add the instructions to be simulated, you click on the program builder and press the 'plus' button. You will be provided with a default instruction, you can change the contents of the instruction by clicking on each part of the instruction, a drop down menu appears, you can choose accordingly.
2. When you click program builder, you are shown two buttons, Example #1 and Example #2, when you click on either of them, default set of instructions are loaded.
3. You can remove any instruction by clicking on '-' button of the particular instruction.
4. Now, you have added instructions, you can come out of program builder by clicking close.
5. To configure the physical registers, click on 'Register values' button and change the values of the physical registers. (32 physical registers are supported)
6. Now, you have configured physical registers, you can come out of the window Register values by clicking close.
7. To configure the simulation parameters of RS and FU, click on the 'RS config' button, you will be presented with three columns.
   1. Op    -  States the operation.
   2. #RS   -  Number of entries in the Reservation station for that particular operand.
   3. #FU   -  Number of entries in the Functional unit for that particular operand.
   4. Delay -  Number of cycles the operation takes to complete.

8. Now, after configuring the simulation parameters of RS and FU, you can come out of the window 'RS config' by clicking close.
9. Now, everything is set to start the simulation.
10. Click on '+' button to start the simulation, clicking on it simulates what the algorithm does in a **single** cycle.
11. Click on '+5' button to simulate the algorithm for **5** cycles.
12. Clicking on 'Reset' button starts the simulation again from start.
13. You can look at Reservation stations, ROB, Register file to understand what changes are happening in them when the algorithm is running.
