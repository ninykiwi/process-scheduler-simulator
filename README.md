# Process Scheduler Simulator
Final project of the Operating Systems discipline at the Federal University of Bahia - UFBA

**PHASE 1)** Consider an operating system that implements process scheduling. The expected operation is that this environment has N processes that can arrive at different times for execution. For each process, the following must be manually informed:
- Arrival time
- Execution time
- Deadline
- System quantum
- System overhead

It is necessary to save this information, so that it is not necessary to repeat this input data when the scheduling algorithm is changed.

This system must implement the scheduling algorithms:
- FIFO
- SJF
- Round Robin
- EDF

**PHASE 2)** This system must implement the page replacement algorithms:
- FIFO
- Least Recently Used

**Requirements:**
- Each process must have up to 10 pages (user input). Each page is 4K in size. The RAM has 200K of memory.
- Create the DISK abstraction for using virtual memory. If there is a page fault, use N u.t. for Disk usage.
- The group is free to create any additional abstraction that may be necessary.
- A RAM and Disk usage graph should be created, showing the pages present in real time.
- Processes only execute if all their pages are in RAM.
- A Gantt chart should be created to show process executions, CPU and RAM visualization
- The response should be given as a function of the average turnaround (waiting time + execution time)
- Include a delay to check execution

For testing, please do not erase the input data after each execution.

- The programming language is chosen by the group.
