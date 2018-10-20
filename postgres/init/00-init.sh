#!/bin/bash -e

psql -U postgres -tc "select 1 from user where usename = 'gitbucket'"        | grep -q 1 || psql -U postgres -c "create role gitbucket login password '${POSTGRES_GITBUCKET_PASSWORD}';"
psql -U postgres -tc "select 1 from pg_database where datname = 'gitbucket'" | grep -q 1 || psql -U postgres -c "create database gitbucket;"
psql -U postgres -c "grant all privileges on database gitbucket to gitbucket;"

