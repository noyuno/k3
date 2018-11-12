#!/bin/bash -e

psql -U "${POSTGRES_USER}" -tc "select 1 from pg_database where datname = 'gitbucket'" | grep -q 1 || psql -U "${POSTGRES_USER}" -c "create database gitbucket template template0 encoding 'unicode';"

