# asgard<sup>2</sup>

asgard<sup>2</sup> is *currently in development* and will be the next generation of the [original asgard system](https://github.com/SoCSTech/asgard-system-stack) which is the [School of Computer Science's](https://lincoln.ac.uk/socs) timetabling and booking system. It manages the events that are running in each one of our computing labs (and other rooms too) to provide data to our [signage screens platform yggdrasil (y2)](https://github.com/SoCSTech/yggdrasil-revamp/tree/asgard2).


## Deployment

This project is deployed to the SoCS internal web server using Docker. There is a [docker-compose.yml](docker-compose.yml) file which holds the configuration file to bring up the system.

The server is expected to be running Ubuntu Server and have Docker and Docker Compose installed. With future versions (after [#18](https://github.com/SoCSTech/asgard2/issues/18) is closed) we may require the server to be configured with Traefik which will be documented here.

### Migrations on the Server

You need to exec into the container - and run the command `npm run db:push` to ensure the data base is in sync with the schema.


## Documentation

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
- Asgard<sup>2</sup>, [Josh Cooper](https://github.com/cooperj).
- Yggdrasil, [Benjamin Williams](https://github.com/blewert).
- A bit of design, and Dockerisation, [Ollie Grooby](https://github.com/Grooben).
- Original Asgard Microservice author [Thomas Reed](https://github.com/treed1104).





##
SoCSTech @ University of Lincoln // INB1201 - 2024