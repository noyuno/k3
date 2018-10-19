#!/bin/bash -e

psql -U postgres -c \
    "create role gitbucket login password '${POSTGRES_GITBUCKET_PASSWORD}'; \
    create database gitbucket; \
    grant all privileges on database gitbucket to gitbucket;"

