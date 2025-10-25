## About

This is the official website for BeaverHacks, a yearly hackathon hosted by the Hackathon Club at Oregon State University. Users can find relevant information regarding the hackathon and submit an application. Officers may view applications and compose a resume book.

## Requirements

- Node: Install the latest version of [Node](https://nodejs.org/en)
- Docker: Install the latest version of [Docker](https://www.docker.com/)

## Setup

1. Clone the repository
  ```bash
  git clone https://github.com/OregonStateHackathonClub/website.git
  ```
2. Navigate to the project directory
  ```bash
  cd website
  ```
3. Download the dependencies
  ```bash
  npm install
  ```
4. Copy the .env.example to .env.local
  ```bash
  cp .env.example .env.local
  ```
5. Message [@81iq](https://discord.com/users/451948906092298241) on Discord to get the required credentials for the `.env.local` file

<br />

> [!WARNING]
> You will not be able to run the application without the env variables.
> Do not share these credentials with anyone else. 
<br />

7. Start a local instance of PostgreSQL using Docker
  ```bash
  docker compose up -d
  ```

8. Run the Next.js App
  ```bash
  npm run dev
  ```
