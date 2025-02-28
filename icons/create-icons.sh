#!/bin/bash

resolutions=(16 32 48 128)

for px in "${resolutions[@]}"; do
    echo "... icon-$px.png"
    inkscape icon.svg -w $px -h $px -o icon-$px.png
done

echo "done"
