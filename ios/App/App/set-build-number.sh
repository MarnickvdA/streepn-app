#!/bin/sh

#  set-build-number.sh
#  App
#
#  Created by Marnick van der Arend on 21/12/2020.
#  
git=$(sh /etc/profile; which git)
number_of_commits=$((`"$git" rev-list HEAD --count --first-parent`))
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
APP_VERSION=$(cat "${DIR}/../../../package.json" | grep version | sed "s/[\",]//g" | tr -d "[[:space:]]" | tr -d "version:")

target_plist="$TARGET_BUILD_DIR/$INFOPLIST_PATH"
dsym_plist="$DWARF_DSYM_FOLDER_PATH/$DWARF_DSYM_FILE_NAME/Contents/Info.plist"

for plist in "$target_plist" "$dsym_plist"; do
  if [ -f "$plist" ]; then
    /usr/libexec/PlistBuddy -c "Set :CFBundleVersion $number_of_commits" "$plist"
    /usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString ${APP_VERSION#*v}" "$plist"
  fi
done
