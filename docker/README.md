# Docker Setup

This directory contains the Docker configuration for the project's development environment.

## Services

- **`db`**: A PostgreSQL 16 database instance.

## Prerequisites

- Docker
- Docker Compose

## Usage

1.  **Create a `.env` file:**
    Copy the `.env.example` file to a new file named `.env` in this directory.

    ```bash
    cp docker/.env.example docker/.env
    ```

2.  **Update environment variables:**
    Modify the `.env` file with your desired database credentials and settings.

    | Variable        | Description                  | Default         |
    | --------------- | ---------------------------- | --------------- |
    | `DB_HOST`       | Database host                | `localhost`     |
    | `DB_PORT`       | Port for the database        | `5432`          |
    | `DB_USERNAME`   | Database username            | `postgres`      |
    | `DB_PASSWORD`   | Database password            | `mysecretpassword` |
    | `DB_NAME`       | Database name                | `my_database`   |

3.  **Start the services:**
    Run the following command from the root of the project to start the database container in detached mode:

    ```bash
    docker-compose -f docker/docker-compose.yml up -d
    ```

4.  **Stop the services:**
    To stop the container, run:

    ```bash
    docker-compose -f docker/docker-compose.yml down
    ```

## Data Persistence

The PostgreSQL data is persisted in a Docker volume named `postgres_data`. This ensures that your data is not lost when the container is stopped or removed.
