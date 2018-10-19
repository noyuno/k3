#!/bin/bash -e
POSTGRES_GITBUCKET_PASSWORD=$1
cat << EOF | tee /docker-entrypoint-initdb.d/init2.sh
#!/bin/bash -e
psql -c "create role gitbucket login password '${POSTGRES_GITBUCKET_PASSWORD}'; \
    create database gitbucket; \
    grant all privileges on database gitbucket to gitbucket;"
EOF

chmod +x /docker-entrypoint-initdb.d/init2.sh

