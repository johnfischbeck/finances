from django.http import HttpResponse, HttpRequest
from django.shortcuts import render
from django.db import connection
import csv

def index(request: HttpRequest) -> HttpResponse:
    """Render the index page."""

    # Build a list of race options (year/type/state/district/csv)
    null = None
    options = [['2004', 'pres', 'National', 'atlarge', '2004_pres_us.csv'],\
               ['2008', 'pres', 'National', 'atlarge', '2008_pres_us.csv'],\
               ['2008', 'senate', 'Alaska', 'atlarge', '2008_senate_ak.csv'],\
               ['2008', 'senate', 'Colorado', 'atlarge', '2008_senate_co.csv'],\
               ['2008', 'senate', 'Georgia', 'atlarge', '2008_senate_ga.csv'],\
               ['2008', 'senate', 'Kentucky', 'atlarge', '2008_senate_ky.csv'],\
               ['2008', 'senate', 'Maine', 'atlarge', '2008_senate_me.csv'],\
               ['2008', 'senate', 'Minnesota', 'atlarge', '2008_senate_mn.csv'],\
               ['2008', 'senate', 'Mississippi', 'atlarge', '2008_senate_ms.csv'],\
               ['2008', 'senate', 'North Carolina', 'atlarge', '2008_senate_nc.csv'],\
               ['2008', 'senate', 'New Hampshire', 'atlarge', '2008_senate_nh.csv'],\
               ['2008', 'senate', 'New Jersey', 'atlarge', '2008_senate_nj.csv'],\
               ['2008', 'senate', 'Oregon', 'atlarge', '2008_senate_or.csv'],\
               ['2008', 'senate', 'Virginia', 'atlarge', '2008_senate_va.csv'],\
               ['2008', 'governor', 'Indiana', 'atlarge', '2008_governor_in.csv'],\
               ['2008', 'governor', 'Missouri', 'atlarge', '2008_governor_mo.csv'],\
               ['2008', 'governor', 'North Carolina', 'atlarge', '2008_governor_nc.csv'],\
               ['2008', 'governor', 'Washington', 'atlarge', '2008_governor_wa.csv'],\
               ['2012', 'pres', 'National', 'atlarge', '2012_pres_us.csv'],\
               ['2016', 'pres', 'National', 'atlarge', '2016_pres_us.csv']]
    
    # Render the page
    print(str(options))
    ctx = {"options":str(options).replace("None","null")}
    return render(request, "polling/index.html", ctx)


def data(request: HttpRequest) -> HttpResponse:
    """
    Return data for the polling application
    """
    try:
        office = request.GET['office']
        state = 'US' if office == 'P' else request.GET['state']
        district = '00' if office == 'P' else request.GET['district']
        year = request.GET['year']
    except KeyError:
        return HttpResponse(return_code=404)
    with connection.cursor() as cursor:
        query_result = cursor.execute('SELECT date, sum, name FROM histogram_data WHERE year=%d AND office=%s AND state=%s AND district=%s;', [year, office, state, district])

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="somefilename.csv"'

    writer = csv.writer(response)
    writer.writerows(query_result)
    
    return response

