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
os.system(cmd)

#print(cmd)

# Read and strip blank lines
valid_rows = []

f=open(name + ".csv", newline="")
csvreader = csv.reader(f, delimiter=",", quotechar="|")
for row in csvreader:
    if len(row) == 0: continue
    else: valid_rows.append(row)
f.close()

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
    #print(valid_rows[cur_row])
    
    # If n == 5, we need to eliminate the oldest
    if n == 5:
        running_sum_dem -= float(valid_rows[cur_row+5][col_dem])
        running_sum_rep -= float(valid_rows[cur_row+5][col_rep])
    
    # Add current row to our running total
    running_sum_dem += float(valid_rows[cur_row][col_dem])
    running_sum_rep += float(valid_rows[cur_row][col_rep])

    # Now increase our n if it's less than 5
    if n < 5:
        n += 1

    # Make a new row and add it
    row = [valid_rows[cur_row][col_poll], valid_rows[cur_row][col_date], str(round(running_sum_dem / n, 1)), str(round(running_sum_rep / n, 1))]
    final_rows = [row] + final_rows

    # Next loop
    cur_row -= 1

# Add first row
final_rows = [[valid_rows[0][col_poll], valid_rows[0][col_date], valid_rows[0][col_dem], valid_rows[0][col_rep]]] + final_rows

# Write everything out
fout = open(name + ".csv", "w", newline="")
csvwriter = csv.writer(fout, delimiter=",", quotechar="|", quoting=csv.QUOTE_MINIMAL)
for row in final_rows:
    csvwriter.writerow(row)
fout.close()
