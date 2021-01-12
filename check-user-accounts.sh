#!/bin/bash
#
# Script to load a batch of new users into OAuth for new service access.
# You may need to create a new client in OAuth specifically for this work.
# The client should have the ROLE_SYSTEM_USER and ROLE_MAINTAIN_OAUTH_USERS roles.
#
# Parameters:
#       1. ENV - [t3|t2|preprod|prod]
#       2. CLIENT - the client Id and secret, colon-separated
#       3. USER - the name of the client used to authenticate
#       4  BATCH - the size of batches (with 5 second pauses between them)
#       5. FILE - the name of the file containing the user data
#
# Example:
#
# $ ./check-user-accounts.sh t3 <client>:<secret> <YOUR USERNAME> 20 users-data.txt | tee output.txt
#
# File format for users:
#
#  A comma-separated file containing one column with just the email address
#
# Make sure there is a new line at the end of the file, otherwise it will not load.
#

ENV=${1?No environment specified}
CLIENT=${2?No client specified}
USER=${3?No user specified}
BATCH=${4?No batch size specified}
FILE=${5?No file specified}

# Set the environment-specific hostname for the oauth2 service
if [[ "$ENV" == "t3" ]]; then
  HOST="https://sign-in-dev.hmpps.service.justice.gov.uk"
elif [[ "$ENV" == "t2" ]]; then
  HOST="https://sign-in-stage.hmpps.service.justice.gov.uk"
elif [[ "$ENV" == "preprod" ]]; then
  HOST="https://sign-in-preprod.hmpps.service.justice.gov.uk"
elif [[ "$ENV" == "prod" ]]; then
  HOST="https://sign-in.hmpps.service.justice.gov.uk"
elif [[ "$ENV" =~ localhost* ]]; then
  HOST="http://$ENV"
fi

# Check whether the file exists and is readable
if [[ ! -f "$FILE" ]]; then
  echo "Unable to find file $FILE"
  exit 1
fi

# Get token for the client name / secret and store it in the environment variable TOKEN
if echo | base64 -w0 >/dev/null 2>&1; then
  AUTH=$(echo -n "$CLIENT" | base64 -w0)
else
  AUTH=$(echo -n "$CLIENT" | base64)
fi

if ! TOKEN_RESPONSE=$(curl -sS -d "" -X POST "$HOST/auth/oauth/token?grant_type=client_credentials&username=$USER" -H "Authorization: Basic $AUTH"); then
  echo "Failed to read token from credentials response"
  echo "$TOKEN_RESPONSE"
  exit 1
fi
TOKEN=$(echo "$TOKEN_RESPONSE" | jq -er .access_token)

AUTH_TOKEN_HEADER="Authorization: Bearer $TOKEN"

cnt=0

echo "\"Email Address\",\"Already exists\""
  
while IFS=, read -r -a row; do
  user="${row[0]}"
  # To uppercase
  user=$(echo "$user" | tr '[:lower:]' '[:upper:]')
  if [[ "$user" == "EMAIL" || -z "$user" ]]; then
    continue
  fi

  RESULTS=$(curl -sS "$HOST/auth/api/authuser?email=$user" -H "$AUTH_TOKEN_HEADER")
    
  if [[ "$RESULTS" == "" ]]; then
    echo "\"${row[0]}\",false"
  else
    echo "$RESULTS" | jq -r '.[0] | [.email, true] | @csv'  
  fi

  
  # Pause for 5 seconds every BATCH number of records
  cnt=$((cnt + 1))
  n=$((cnt % BATCH))
  if [[ $n -eq 0 ]]; then
    sleep 5
  fi

done <"$FILE"

# End