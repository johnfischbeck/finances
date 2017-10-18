import csv
import zipfile
import os
from re import fullmatch
import codecs
from shared.models import IndivCandDonation, Candidate
from django.core.management.base import BaseCommand, CommandError

names = "committee_id, amendment_ind, report_type, transaction_pgi, image_num, transaction_type, entity_type, name, city, state, zip_code, employer, occupation, transaction_date, transaction_amount, other_id, transaction_id, file_num, memo_code, memo_text, row_id"
names = names.split(', ')

class Command(BaseCommand):
    def handle(self, *args, **options):
        data_dir = '/home/nanvis/data/ftp.fec.gov/FEC'
        outside_name = 'indiv'
        inside_name = 'itcont.txt'
        years = [i for i in os.listdir(data_dir) if fullmatch('[\d]{4}', i)]
        error_file = open("errors.txt", "w")
        outfile = open("data.csv", "w")
        outcsv = csv.writer(outfile)

        for year in years:
            try:
                zf = zipfile.ZipFile(data_dir + '/' + year + '/' + outside_name + year[2:] + '.zip')
            except FileNotFoundError:
                print("Unable to open file for year {}".format(year))
                continue
            with zf.open(inside_name) as inner_file:
                print("opened data for {}".format(year))
                rows = errors = 0
                reader = csv.reader(codecs.iterdecode(inner_file, 'utf8', errors="ignore"), delimiter='|')
                for row in reader:
                    try:
                        row = list(row)
                        if len(row) != 21:
                            print("Invalid row length")
                            continue
                        if row[13]:
                            row[13] = row[13][-4:] + '-' + row[13][:2] + '-' + row[13][2:-4]
                        outcsv.writerow(row)
                        rows += 1
                        if rows % 1000000 == 0:
                            print("Done {} rows".format(rows))
                    except Exception:
                        print("Row failed: transaction id {}".format(row[-1]))
                        error_file.write(str(row) + '\n')
                        errors += 1
                        if errors % 10 == 0:
                            error_file.flush()
                        
