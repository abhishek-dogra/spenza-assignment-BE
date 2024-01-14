# Webhook Admin

### Database Setup

To set up the database, ensure Docker is installed, and run the following command in the command prompt:
```bash
docker run -d \
--name postgres \
-p 5432:5432 \
-e POSTGRES_USER=postgres \
-e POSTGRES_PASSWORD=postgres \
-e POSTGRES_DB=sorted \
postgres
```

Now, you can view/open the database using tools like pgAdmin or DBeaver. 
Execute the following scripts to create the database schema and tables.

#### Create Schema
```
CREATE SCHEMA spenza_challenge AUTHORIZATION postgres;
```

#### Create user Table
```
CREATE TABLE spenza_challenge."user" (
id uuid NOT NULL DEFAULT gen_random_uuid(),
email varchar(320) NOT NULL,
"password" varchar NOT NULL,
"name" varchar NOT NULL,
CONSTRAINT user_pk PRIMARY KEY (id),
CONSTRAINT user_un UNIQUE (email)
);
```

#### Create webhook Table
```
CREATE TABLE spenza_challenge.webhook (
id bigserial NOT NULL,
"name" varchar NOT NULL,
CONSTRAINT webhook_pk PRIMARY KEY (id),
CONSTRAINT webhook_un UNIQUE (name)
);
```
#### Create webhook_usage_log Table
```
CREATE TABLE spenza_challenge.webhook_usage_log (
id uuid NOT NULL DEFAULT gen_random_uuid(),
user_webhook_id uuid NOT NULL,
"timestamp" timestamp NOT NULL,
"data" jsonb NULL,
source_url varchar NULL,
retries int4 NULL,
CONSTRAINT webhook_usage_log_pk PRIMARY KEY (id)
);
```

#### Create webhook_user Table
```
CREATE TABLE spenza_challenge.webhook_user (
id uuid NOT NULL DEFAULT gen_random_uuid(),
user_id uuid NOT NULL,
webhook_id int8 NOT NULL,
active bool NOT NULL,
source_url jsonb NULL,
retry_count int4 NULL,
CONSTRAINT webhook_user_pk PRIMARY KEY (id),
CONSTRAINT webhook_user_un UNIQUE (user_id, webhook_id)
);
```

### Initial Data Population for Webhooks

To populate the initial data for webhooks, execute the following queries:
```
INSERT INTO spenza_challenge.webhook ("name") VALUES('NOTIFICATION');
INSERT INTO spenza_challenge.webhook ("name") VALUES('LOGGING');
INSERT INTO spenza_challenge.webhook ("name") VALUES('SAVE_DATA');
INSERT INTO spenza_challenge.webhook ("name") VALUES('ANALYSIS');
```
---
### Application Setup

Before you proceed with the installation, make sure you have Node.js and npm (Node Package Manager) installed on your machine.

Once Node.js and npm are installed, you can install the required dependencies for the application using the following command:

We would require the .env file in the root directory, which would contain database credentials and some secret keys.
reference .env file has been pushed in the repository which is configured for the given postgres setup.

#### Installation

```bash
$ npm install
```

#### Running the app
To start the application, use the following command:
```bash
$ npm run start
```
---
### Testing

The test script is provided with the repository itself, in the file called test-script.js

The script would send dummy process requests at an interval of 1 second.
#### Testing Setup

```
Before running the testing script modify the webhookDataArray in the script.
webhookDataArray contains the webhook name and sourceUrl.
As per the additional data, script would randomly send some decimal numbers as per the current logic.

The API key would also be required for sending process webhook requests.

To get the API key 
--> log into the web portal 
--> in the nav bar click on get API Key
--> Click on the copy button to copy to the clipboard or the eye icon to view it.

now this API key should be send as a header ('whs-secret-key') in the process API.
```

#### Running the testing script
To start the testing script, use the following command:
```bash
$ node test-script.js
```
