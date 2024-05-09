# Asgard2 Data Importer

This is a temporary script conversion to get the data from the UoL Timetabling system and convert it to something a2 can use.

Before you can run this, you need to create a folder with the following structure:

```
json
    -> inb1101.json
    -> inb1102.json
    -> inb1103.json
    -> inb1301.json
    -> inb2102.json
    -> inb2305.json
```

Then you need to run the code as
```
python3 main.py [room code] [timetable id]
```

This will eventually be moved into a script.