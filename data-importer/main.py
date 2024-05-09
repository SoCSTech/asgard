# how to use
# -----------
# edit config.json with details or run
# main.py with desired room number. make sure
# json files in json folder are up to date with raw
# json spat from timetabling api. check dump folder
# afterwards.

# to do:
# make this script interact directly with asgardDB so that we can just
# simply run this and have it put the timetable entries directly in

import json
import datetime
import sys 
import re
from dateutil import parser
import requests

config = {}
with open('config/config.json', 'r') as f:
	config = json.load(f)

room = config["default_room"]
timetable_id = config["timetable_ids"][room]

if len(sys.argv) >= 3:
	room = sys.argv[1]
	timetable_id = sys.argv[2]
	
current_week_date = parser.parse(config["current_week_start_date"])
current_week = config["current_week"]
cell_colour = config["colors"]["default"]

f = open(f'json/{room}.json', 'r')
obj = json.load(f)
f.close()

data = obj["returned"]["timetableEntries"]

items = []

for entry in data:
    try: 
      if entry["weeksMap"][current_week] == "1":
        items.append(entry)
    except IndexError:
      print(entry["allModuleTitles"], ": booking problem - corrupted data?")

lecture_color = config["colors"]["lecture"]
works_color = config["colors"]["workshop"]


for item in items:
	event = item['allEventTypes']

	if event == "WORKS": 
		event = "WORKSHOP"

	elif event == "LECTURE": 
		event = "LECTURE"

	elif event == "LEC/SEM":
		event = "LECTURE"

	elif event == "PRACTICAL":
		event = "PRACTICAL"
  
	elif event == "EXAM":
		event = "EXAM"

	elif event == "TEST":
		event = "EXAM"
  
	else:
		event = "OTHER"
    
	moduleId = item['allModuleIds']
	module = re.search(r"[ACM](.{2}\d)\d{3}", moduleId)
	# print(module) # sometimes, a module ID doesn't exist, so just give it a default colour.
	try:
		m = module.group(1)
	except AttributeError:
		m = "NO"
		print('!! no colour assigned')
  
	print(m)
  
  	# assign colours per level (CMP1, CGP2 etc...)
	if m == 'GP1':
		cell_colour = '#FCC05F'
	if m == 'GP2':
		cell_colour = '#B68AE5'
	if m == 'GP3':
		cell_colour = '#E38178'
	if m == 'GP9':
		cell_colour = '#59D5D9'
	if m == 'MP1':
		cell_colour = '#7AF58F'
	if m == 'MP2':
		cell_colour = '#7AB4F5'
	if m == 'MP3':
		cell_colour = '#CF8BA3'
	if m == 'MP9':
		cell_colour = '#6AF0CA'
	if m == 'TH1':
		cell_colour = '#BDC667'
	if m == 'TH2':
		cell_colour = '#A4A4CB'
	if m == 'TH3':
		cell_colour = '#E58A92'
	if m == 'TH9':
		cell_colour = '#C293C8'
	if m == 'GY3':
		cell_colour = '#D6FFFE'
	if m == 'HY2':
		cell_colour = '#A2AEBB'
	if m == 'HY9':
		cell_colour = '#FF9B71'
	if m == 'GR9':
		cell_colour = '#E481FC'
	if m == 'NO':
		cell_colour = '#FFFFFF'
		print("def colour")

	name = f"{event}: {item['allModuleTitles']}"
	day_num = item["weekDay"] - 1
	start_time = item["startTime"]
	duration_mins = item["duration"]

	start_dt = current_week_date + datetime.timedelta(days=day_num)

	split = start_time.split(":")
	hrs = int(split[0])
	mins = int(split[1])

	start_dt = start_dt + datetime.timedelta(hours=hrs)
	start_dt = start_dt + datetime.timedelta(minutes=mins)

	end_dt = start_dt + datetime.timedelta(minutes=duration_mins)

	if len(moduleId) > 20:
		moduleId = ""
		
	url = config["asgard_server"] + "/v2/event"
	data = {
		"name": item["allModuleTitles"],
		"staff": item["allLecturerNames"],
		"moduleCode": moduleId,
		"timetableId": timetable_id,
		"type": event,
		"colour": cell_colour,
		"start": start_dt.isoformat(),
		"end": end_dt.isoformat(),
		"isCombinedSession": False # To Be Implemented Later
	}
	# print(data)
	token = "" # TODO: login with system account automatically.
	headers = {"Authorization": "Bearer " + token}
 
	try:
		req = requests.post(url, json=data, headers=headers)
		print(name)
		print(start_dt)
		print(end_dt)
		print(req.status_code)
		print("-" * 6)
		print("")
	except:
		print("is the api server broken? im having trouble making requests!")
		exit()

print("✅")