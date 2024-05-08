## HighLevel FullStack Assesment: Backend

### Tech Stack
1. Node.js (In cluster mode)
2. TypeScript
3. Docker
4. SequelizeORM with Prisma for db migrations
5. MySql
6. Nginx, AWS EC2, S3

---

#### Local Development Setup:
1. clone the repo
2. install packages via yarn `yarn install` ( to install yarn `npm i -g yarn` )
3. install docker for respective OS
4. need 2 `.env` files to start the backend, these are already provided in the E-mail.
	1.	`.docker.env` for docker compose
	2.	`.env` for nodejs
	3. be sure to set correct `NODE_ENV` in these yourself 
6. build docker image `docker compose build`
7. run the docker image `docker compose up`, it will start the nodejs and the MySql database, also the project volume mounted in the docker container  support for hot restart is there.

The backend is running on `http://52.66.17.184/`

the required postman collection is already share on the email

Thanks

---