import sys
import os
import csv

# Python path
pypath = r"C:\Python34\python.exe"

# Read arguments
url = sys.argv[1]
name = sys.argv[2]

# Invoke the RCP grabber
cmd = pypath + " rcp/rcp.py -o " + name + ".csv " + url
#os.system(cmd)

# Read and strip blank lines
valid_rows = []

f=open(name + ".csv", newline="")
csvreader = csv.reader(f, delimiter=",", quotechar="|")
for row in csvreader:
    if len(row) == 0: continue
    else: valid_rows.append(row)

# Remove final results and average
valid_rows = [valid_rows[0]] + valid_rows[3:]

# Identify what we need to keep - "Poll", "Date", the Dem, and the Rep
col_poll = 0
col_date = 1

col_dem = -1
for i in range(0, len(valid_rows[0])):
    opt = valid_rows[0][i]
    if "(D)" in opt:
        col_dem = i
        break
if col_dem == -1:
    print("Bad CSV")
    sys.exit(1)

col_rep = -1
for i in range(0, len(valid_rows[0])):
    opt = valid_rows[0][i]
    if "(R)" in opt:
        col_rep = i
        break
if col_rep == -1:
    print("Bad CSV")
    sys.exit(1)

# Start building a running average
final_rows = []

running_sum_dem = 0
running_sum_rep = 0
n = 0

cur_row = len(valid_rows) - 1
while cur_row > 0:
    # If n == 5, we need to eliminate the oldest
    if n == 5:
        running_sum_dem -= valid_rows[cur_row-5][col_dem]
        running_sum_rep -= valid_rows[cur_row-5][col_rep]
    
    # Add current row to our running total
    running_sum_dem += valid_rows[cur_row][col_dem]
    running_sum_rep += valid_rows[cur_row][col_rep]

    # Now increase our n if it's less than 5
    if n < 5:
        n += 1

    # 
