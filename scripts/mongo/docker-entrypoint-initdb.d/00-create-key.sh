#!/bin/bash -eux

cd /tmp
openssl rand -base64 756 > mongodb.key
chmod 400 mongodb.key
