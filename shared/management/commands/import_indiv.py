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


        for year in years:
            try:
                zf = zipfile.ZipFile(data_dir + '/' + year + '/' + outside_name + year[2:] + '.zip')
            except FileNotFoundError:
                print("Unable to open file for year {}".format(year))
                continue
            with zf.open(inside_name) as inner_file:
                print("opened data for {}".format(year))
                rows = 0
                reader = csv.reader(codecs.iterdecode(inner_file, 'utf8'), delimiter='|')
                for row in reader:
                    row = list(row)
                    row[13] = row[13][-4:] + '-' + row[13][:2] + '-' + row[13][2:-4]
                    row[15] = row[15] or None
                    row[17] = row[17] or None
                    if Candidate.objects.filter(cand_pcc=row[0]).exists():
                        IndivCandDonation.objects.create(**dict(zip(names, row)))
                    rows+= 1
                if rows % 1000 == 0:
                    print("{}: {} rows loaded".format(year, rows))
