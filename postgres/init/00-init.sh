#!/bin/bash -e

i() {
    t=$1
    p=$2
    psql -U postgres -tc "select 1 from pg_user where usename = '$t'"        | grep -q 1 || psql -U postgres -c "create role $t login password '$p';"
    psql -U postgres -tc "select 1 from pg_database where datname = '$t'" | grep -q 1 || psql -U postgres -c "create database $t template template0 encoding 'unicode';"
    psql -U postgres -c "grant all privileges on database $t to $t;"
}

i gitbucket "${POSTGRES_GITBUCKET_PASSWORD}"
i owncloud  "${POSTGRES_OWNCLOUD_PASSWORD}"

