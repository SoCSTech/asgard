# how to use
# -----------
# edit config.json with details or run
# main.py with desired room number. make sure
# json files in json folder are up to date with raw
# json spat from timetabling api. check dump folder
# afterwards.

import json
import datetime
import sys 
import re
from dateutil import parser
import requests

# load the config file
config = {}
with open('config/config.json', 'r') as f:
	config = json.load(f)

# Login to asgard and get a token
login_url = config["asgard_server"] + "/v2/auth/login"
creds = {"username": config["asgard_username"], "password": config["asgard_password"]}
req = requests.post(login_url, json=creds)
token = json.loads(req.text)['TOKEN']

# set up the room and timetable id with default values
room = config["default_room"]
timetable_id = config["timetable_ids"][room]

# replace them with arguments
if len(sys.argv) >= 3:
	room = sys.argv[1]
	timetable_id = sys.argv[2]
	
# set up the current week stuff 
# currently being done in the config file for testing, but will be done automatically soon 
current_week_date = parser.parse(config["current_week_start_date"])
current_week = config["current_week"]
cell_colour = config["colors"]["default"]

# load the dumped json from uol timetable
f = open(f'json/{room}.json', 'r')
obj = json.load(f)
f.close()

data = obj["returned"]["timetableEntries"]
items = []

# Get only this weeks events from the list of all possible events
for entry in data:
    try: 
      if entry["weeksMap"][current_week] == "1":
        items.append(entry)
    except IndexError:
      print(entry["allModuleTitles"], ": booking problem - corrupted data?")

# default colours!!
lecture_color = config["colors"]["lecture"]
works_color = config["colors"]["workshop"]

# go through each event
for item in items:
	event = item['allEventTypes']
	eventName = ""

	# Remove numbers from event type (some other schools we might be absorbing do this???)
	event = "".join([character for character in str(event) if not character.isdigit()])
 
	# convert the event's type to one of the ENUM values in asgard.
	if event == "WORKS": 
		event = "WORKSHOP"
		eventName = "Workshop"

	elif event == "LECTURE": 
		event = "LECTURE"
		eventName = "Lecture"

	elif event == "LEC/SEM":
		event = "LECTURE"
		eventName = "Lecture/Seminar"

	elif event == "SEM":
		event = "LECTURE"
		eventName = "Seminar"
  
	elif event == "SEMINAR":
		event = "LECTURE"
		eventName = "Seminar"

	elif event == "PRACTICAL":
		event = "PRACTICAL"
		eventName = "Practical"
  
	elif event == "PROJ":
		event = "PROJECT"
		eventName = "Project"
  
	elif event == "PROJECT":
		event = "PROJECT"
		eventName = "Project"
  
	elif event == "CLASS":
		event = "WORKSHOP"
		eventName = "Class"
  
	elif event == "REVIS":
		event = "WORKSHOP"
		eventName = "Revision"
  
	elif event == "EXAM":
		event = "EXAM"
		eventName = "Exam"

	elif event == "TEST":
		event = "EXAM"
		eventName = "Test"
  
	else:
		event = "OTHER"
    
    # get the module code, turn it into a reduced form so that we can filter by year group and module. 
    # this is how asgard1 did it and this may have to change depending on what happens with the school stuff!
    # (if we push a2 and y2 to more than what is socs now - we may have to make more colours and the colours do things nicer.)
    # plus new courses like BSc Robotics dont have a colour in this script yet!!
	moduleId = item['allModuleIds']
	module = re.search(r"[ACM](.{2}\d)\d{3}", moduleId)
	# print(module) # sometimes, a module ID doesn't exist, so just give it a default colour.
	try:
		m = module.group(1)
	except AttributeError:
		m = "NO"
		print('🖍️  no colour assigned')
  
  	# assign colours per level (CMP1 = MP1, CGP2 = GP = 2 etc...)
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

	# Get a nice name for the event!
	name = item['allModuleTitles']
	if event != "OTHER":
		name = f"{eventName}: {item['allModuleTitles']}"
 
 
	# calculate start and end times from the duration
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

	# ? If the module code is way too long don't include it
	# TODO: convert this to a REGEX so that only module codes can get through 
 	# TODO: ... because if you book an event in CMIS the module code will be the full event name. 
	if len(moduleId) > 20:
		moduleId = ""
		
  	# Send Asgard the new event!
	url = config["asgard_server"] + "/v2/event"
	data = {
		"name": name,
		"staff": item["allLecturerNames"],
		"moduleCode": moduleId,
		"timetableId": timetable_id,
		"type": event,
		"colour": cell_colour,
		"start": start_dt.isoformat(),
		"end": end_dt.isoformat(),
		"isCombinedSession": False # To Be Implemented Later
	}
 
	headers = {"Authorization": "Bearer " + token}
 
	try:
		req = requests.post(url, json=data, headers=headers)
		
		if req.status_code == 201:
			print(name)
			print(start_dt, end_dt)
		else:
			print(f"⛔️ {req.status_code} -> {name}")
			print(req.text)

		print("")
	except:
		print("is the api server broken? im having trouble making requests!")
		exit()

print("✅")