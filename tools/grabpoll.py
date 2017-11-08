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

col_dem = -1
for i in range(0, len(valid_rows[0])):
    opt = valid_rows[0][i]
    if "(D)" in opt:
        col_dem = i
        break
if col_dem == -1:
    print("Bad CSV")
    sys.exit(1)

# Start building a running average
final_rows = []

cur_row = len(valid_rows) - 1
while cur_row > 0:
    pass
