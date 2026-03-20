#!/bin/bash

REPO="bobguffie/crafters-vector-pro"
RELEASES="https://api.github.com/repos/$REPO/releases/latest"

if [[ "$OSTYPE" == "darwin"* ]]; then
    ASSET=$(curl -s $RELEASES | grep -o 'https://github.com/[^"]*\.dmg' | head -n 1)
    if [ -n "$ASSET" ]; then
        echo "Downloading Crafters Vector Pro for macOS..."
        curl -L -o CraftersVectorPro.dmg "$ASSET"
        echo "Mounting DMG..."
        hdiutil attach CraftersVectorPro.dmg
        echo "Installing to Applications..."
        cp -R /Volumes/Crafters\ Vector\ Pro/Crafters\ Vector\ Pro.app /Applications/
        hdiutil detach /Volumes/Crafters\ Vector\ Pro/
        rm CraftersVectorPro.dmg
        echo "Installation complete!"
    else
        echo "No macOS installer found in the latest release."
    fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    ASSET=$(curl -s $RELEASES | grep -o 'https://github.com/[^"]*\.AppImage' | head -n 1)
    if [ -n "$ASSET" ]; then
        echo "Downloading Crafters Vector Pro for Linux..."
        curl -L -o CraftersVectorPro.AppImage "$ASSET"
        chmod +x CraftersVectorPro.AppImage
        echo "Installation complete! Run ./CraftersVectorPro.AppImage to start."
    else
        echo "No Linux installer found in the latest release."
    fi
else
    echo "Unsupported OS: $OSTYPE"
fi
