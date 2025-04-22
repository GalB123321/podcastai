#!/bin/bash

# Create output directory if it doesn't exist
mkdir -p public/png

# Convert all SVG files in public directory
for svg in public/*.svg; do
    # Get the filename without path and extension
    filename=$(basename "$svg" .svg)
    
    # Convert SVG to PNG with high quality settings
    convert -density 300 -background none "$svg" -resize 1024x1024\> "public/png/$filename.png"
    
    echo "Converted $filename.svg to $filename.png"
done

echo "All conversions complete!" 