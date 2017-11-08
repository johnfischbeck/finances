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

