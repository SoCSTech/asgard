# Creating Your First User

> :warning: This is in development and will need reviewing and rewriting eventually.


1. get the repo cloned...

2. open VS Code in the `api` directory

3. reopen in dev container... this will start the database!

4. open Azure Data Studio, MySQL Workbench or a terminal to the `db` container.

5. in new terminal inside of the container, type `node` to open a nodejs terminal... we are doing this in the container because we want to use `short-uuid`

6. run the command 
```ts 
const short = require('short-uuid');
```
You will get the response `undefined` this is fine.

7. run the command
```ts
short.generate();
```
You will get a response like `'addd3df3-d227-4e12-ad35-4e00633de7b5'` copy it.

8. go to https://bcrypt-generator.com/ and generate a bcrypt of whatever password you want. (or use the one I have given you... im not your boss)

9. connect to the `asgard` database and run the following command.

```sql
INSERT INTO `users` 
(`id`, `username`, `short_name`, `full_name`, `role`, `email`, `password`, `creation_date`, `reset_token`, `reset_token_expiry`, `profile_picture_url`, `is_deleted`, `initials`) 
VALUES 
('addd3df3-d227-4e12-ad35-4e00633de7b5', 'joshcooper', 'Josh', 'Josh Cooper', 'TECHNICIAN', 'joshcooper@lincoln.ac.uk', '$2a$12$l5YP7j9UcVujD9NBzfwlk.j9f85A4Kigml24K2mhZpka2STgjZmOa', NOW(), NULL, NULL, NULL, 0, 'JC');
```

This will create you a `joshcooper` user with the password `computing`... feel free to substitute in your own information...

10. Login :D