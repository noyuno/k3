#!/bin/bash

set -e

echo "Job get started: $(date +'%Y%m%d-%H%M')"
umask 0
aws s3 cp $PARAMS  "$S3_PATH" "$DATA_PATH"
echo "Job get finished: $(date +'%Y%m%d-%H%M')"