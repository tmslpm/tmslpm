#!/bin/bash
declare -r day_of_week=$(date "+%u")
declare -r usr="<a href=\"https://github.com/tmslpm/tmslpm\">~/github/tmslpm</a>"
declare output="$ <a href=\"https://github.com/tmslpm/tmslpm/blob/main/.github/scripts/generate-readme.sh\">./.github/scripts/generate-readme.sh</a>\n"

log() {
  for arg in "$@"; do
    output+="$(date "+%H:%M:%S") $usr> $arg \n"
  done
}

logFollow() {
  for arg in "$@"; do
    output+="$arg \n"
  done
}

generateJoke() {
  jokeApiResponse=$(curl -s "https://v2.jokeapi.dev/joke/Programming?blacklistFlags=nsfw,religious,political,racist,sexist,explicit")
  jokeApiFieldError=$(echo "$jokeApiResponse" | grep '"error"' | cut -d ':' -f2 | tr -d ' ",')
  jokeApiFieldType=$(echo "$jokeApiResponse" | grep '"type"' | cut -d ':' -f2 | tr -d ' ",')
  log "Fetching awesome joke from jokeapi.dev"
  if [[ "$jokeApiFieldError" == "true" ]]; then
    logFollow "Aie! No joke today.."
  elif [[ "$jokeApiFieldError" == "false" ]]; then
    if [[ "$jokeApiFieldType" == "single" ]]; then
      logFollow "> $(echo "$jokeApiResponse" | grep '"joke"' | cut -d ':' -f2 | tr -d '",')"
    elif [[ "$jokeApiFieldType" == "twopart" ]]; then
      logFollow ">$(echo "$jokeApiResponse" | grep '"setup"' | cut -d ':' -f2 | tr -d '",')"
      logFollow " $(echo "$jokeApiResponse" | grep '"delivery"' | cut -d ':' -f2 | tr -d '",')"
    else
      logFollow "Aie! No joke today (bad type: $jokeApiFieldType)"
    fi
  else
    logFollow "Aie! No joke today.."
  fi
}

generateDate() {
  current_date=$(date "+%Y-%m-%d")
  echo "$current_date \n"
}

generateLoadingCat() {
  a=$((RANDOM % 50 + 1))
  b=$((RANDOM % 20 + a))
  log "Loading cats... 🐱 Found $a. Installing $b."
}

generateDependencies() {
  a=$((RANDOM % 111111 + 1))
  b=$((a - 3))
  log "Installing $a dependencies..."
  logFollow " - cats@3.14159" " - fake-news@118.218" " - overcaffeinated@69.69.69"
  logFollow "and $b more lines hidden..."
  sleep 1
}

main() {
  log "Hello World 🎉" "Debugging spaghetti code... 🍝 In progress..."
  generateDependencies
  generateLoadingCat
  generateJoke
  str="<pre><code>${output}</code></pre>"
  str+=$(cat ".github/scripts/readme.md")
  echo -e $str >readme.md
}

main
