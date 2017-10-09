from django.db import models

# Create your models here.

class Candidate(models.Model):
    cand_id = models.CharField(unique=True, max_length=9)
    cand_name = models.CharField(max_length=200, blank=True, null=True)
    cand_pty_affiliation = models.CharField(max_length=3, blank=True, null=True)
    cand_election_year = models.IntegerField(blank=True, null=True)
    cand_office_st = models.CharField(max_length=2, blank=True, null=True)
    cand_office = models.CharField(max_length=1, blank=True, null=True)
    cand_office_district = models.CharField(max_length=2, blank=True, null=True)
    cand_ici = models.CharField(max_length=1, blank=True, null=True)
    cand_status = models.CharField(max_length=1, blank=True, null=True)
    cand_pcc = models.CharField(max_length=9, blank=True, null=True)
    cand_st1 = models.CharField(max_length=34, blank=True, null=True)
    cand_st2 = models.CharField(max_length=34, blank=True, null=True)
    cand_city = models.CharField(max_length=30, blank=True, null=True)
    cand_st = models.CharField(max_length=2, blank=True, null=True)
    cand_zip = models.CharField(max_length=9, blank=True, null=True)
    cand_data_year = models.SmallIntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'candidates'


class IndivCandDonation(models.Model):
    committee_id = models.CharField(max_length=9)
    amendment_ind = models.CharField(max_length=1, blank=True, null=True)
    report_type = models.CharField(max_length=3, blank=True, null=True)
    transaction_pgi = models.CharField(max_length=5, blank=True, null=True)
    image_num = models.CharField(max_length=18, blank=True, null=True)
    transaction_type = models.CharField(max_length=3, blank=True, null=True)
    entity_type = models.CharField(max_length=3, blank=True, null=True)
    name = models.CharField(max_length=200, blank=True, null=True)
    city = models.CharField(max_length=30, blank=True, null=True)
    state = models.CharField(max_length=2, blank=True, null=True)
    zip_code = models.CharField(max_length=9, blank=True, null=True)
    employer = models.CharField(max_length=38, blank=True, null=True)
    occupation = models.CharField(max_length=38, blank=True, null=True)
    transaction_date = models.DateField(blank=True, null=True)
    transaction_amount = models.DecimalField(max_digits=14, decimal_places=2, blank=True, null=True)
    other_id = models.CharField(max_length=9, blank=True, null=True)
    transaction_id = models.CharField(max_length=32, blank=True, null=True)
    file_num = models.DecimalField(max_digits=22, decimal_places=0, blank=True, null=True)
    memo_code = models.CharField(max_length=1, blank=True, null=True)
    memo_text = models.CharField(max_length=200, blank=True, null=True)
    row_id = models.DecimalField(max_digits=19, decimal_places=0)

    class Meta:
        managed = False
        db_table = 'indiv_cand_donations'
