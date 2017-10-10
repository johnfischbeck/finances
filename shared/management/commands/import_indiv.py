import csv
import zipfile
import os
from re import fullmatch
import codecs
from shared.models import IndivCandDonation, Candidate
from django.core.management.base import BaseCommand, CommandError


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
                    row[13] = row[13][-4:] + '-' + row[13][2:-4] + '-' + row[13][:2]
                    row[15] = row[15] or None
                    row[17] = row[17] or None
                    if Candidate.objects.filter(cand_pcc=row[0]).exists():
                        continue
                    IndivCandDonation.objects.create(*row)
                    rows+= 1
                if rows % 1000 == 0:
                    print("{}: {} rows loaded".format(year, rows))
