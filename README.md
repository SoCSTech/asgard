# asgard

Asgard is the system designed for improving the experience of the Computing Labs at the [University of Lincoln](https://www.lincoln.ac.uk/studywithus/subjects/computerscienceandgamescomputing/). It is designed around managing aspects of the lab such as signage, timetabling and lab occupancy. Asgard provides the back of house management system for student facing projects such as [yggdrasil](https://github.com/SoCSTech/yggdrasil) which comes under the asgard family of projects. 

This iteration (asgard<sup>2</sup>) has been built on the back of the work previously done by former technicians to improve the functionality and capability of the system.

## Getting started

No matter if you are developing or deploying you will need to use [Docker](https://docker.com) as the whole system is designed around it.

If you are developing, you should use a Code Editor such as [Visual Studio Code](https://code.visualstudio.com) which can support [Devcontainers](https://containers.dev/). You will then be able to open one of the 'sub-projects' and work inside of it and make changes, on your own branch or fork.

Or if you are wanting to deploy for production, you should use the [docker-compose.yml](docker-compose.yml) file, which holds the configuration file to bring up the system with all the different components.

Once you have brought up your environment, you will need to run some migrations against the database. To do this you will need to connect into the running `api` container. You can do that by running:
```bash
docker exec -it asgard-api bash
```
You should then have a shell inside of the container, where you can run the following migration command:
```bash
npm run db:push
```
This will ensure your version of the database matches what the stack is expecting!


## Top Guides

| Document | Purpose |
| -------- | ------- |
| [Colours](/docs/colours.html) | List of the colours used with their hex code and name within Tailwind |
| [Data Design](#data-design) | Overview of how the tables in the database interact with each other. |
| [Creating Your First User](/docs/create-first-user.md) | Manually creating your first user in the system (so I don't have to make a wizard). |


### Data Design

![](/docs/database.drawio.png)

| Table | Description | Why? |
| ----- | ----------- | ---- |
| Users | People who have access to the asgard system to do sensitive actions such as add or remove events. | This is so we can have a password protected interface to prevent unauthorized changes. |
| User/Timetables | What timetables can a user access and modify. | A user can be a standard user, where they will only have access to a set amount of timetables - this is useful for having accounts with limited access. |
| Timetables | Timetables have events and can be rooms, desks, or people. | |
| Timetable Groups | A collection of timetables. | So we can have screens that show the status of multiple timetables in an overview, for places such as the top of stairs. |
| Events | Events are things that happen in a timetabled space. | |
| Carousels | Things that show on the timetable displays, such as the week overview booking screen, pictures (for health and safety notices etc), and videos. | Allow us to control what is shown on the displays |
| Desks | A desk is a location in a timetable which can report back it's status. | This allows us to know if a desk is in use, so we report this activity of the room on a display. |



## Credits
- [Josh Cooper](https://github.com/cooperj)
- [Benjamin Williams](https://github.com/blewert)
- [Ollie Grooby](https://github.com/Grooben)
- [Thomas Reed](https://github.com/treed1104)





##
Computer Science Technical Service @ University of Lincoln, UK // INB1201 - 2024