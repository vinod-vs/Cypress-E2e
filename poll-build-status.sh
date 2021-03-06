#!/bin/sh

# Get the build ID from the run command's output
BUILD_ID=$(grep -E 'BUILD_ID=[a-z,A-Z,0-9]*' ./log/build_results.txt | cut -c 10-)

# Or, you can read this from the log/build_results.txt file as well

# Say, it takes around 60 seconds on an average to finish your tests
# You can wait for 60 seconds, and then start polling for build status every 10 seconds
BUILD_TIME_AVG=60
POLLING_INTERVAL=10
BUILD_STATUS="running"

$(sleep $BUILD_TIME_AVG)

while [ $BUILD_STATUS == "running" ]
do
  # Get the build status
  $(browserstack-cypress build-info $BUILD_ID > temp.txt)
  BUILD_STATUS=$(awk '/"status":/ {print $2} ' temp.txt | head -n1 | cut -d"," -f1 | cut -d"\"" -f2)
  $(rm temp.txt)

  # Sleep until next poll
  $(sleep $POLLING_INTERVAL)
done
