from django.shortcuts import render


def index(request):
    """Render the index page."""

    # Build a list of race options (year/type/state/district/csv)
    null = None
    options = [['2004', 'pres', 'national', 'atlarge', '2004pres.csv'],\
               ['2008', 'pres', 'national', 'atlarge', '2008pres.csv']]
    
    # Render the page
    print(str(options))
    ctx = {"options":str(options).replace("None","null")}
    return render(request, "polling/index.html", ctx)
