import os
import shutil

os.makedirs("stateNames-simple", exist_ok=True)
os.makedirs("cds-simple", exist_ok=True)

for state in os.listdir("stateNames"):
    if state == "kml": continue
    shutil.copyfile(
        "stateNames/%s/shape.geojson" % state,
        "stateNames-simple/%s.geojson" % state.lower())

for district in os.listdir("cds/2016"):
    if district == "kml": continue
    shutil.copyfile(
        "cds/2016/%s/shape.geojson" % district,
        "cds-simple/%s.geojson" % district.lower())
