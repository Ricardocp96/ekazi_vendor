#!/bin/bash

# Bash script to verify FOREGROUND_SERVICE_MEDIA_PROJECTION permission is removed
# Run this after building your AAB file

echo "========================================"
echo "Permission Verification Script"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if bundletool is available
if command -v bundletool &> /dev/null; then
    echo -e "${GREEN}[✓] bundletool is installed${NC}"
    BUNDLETOOL_AVAILABLE=true
else
    echo -e "${YELLOW}[✗] bundletool is not installed${NC}"
    echo "   Download from: https://github.com/google/bundletool/releases"
    BUNDLETOOL_AVAILABLE=false
fi

# Check if aapt2 is available
if command -v aapt2 &> /dev/null; then
    echo -e "${GREEN}[✓] aapt2 is available${NC}"
    AAPT2_AVAILABLE=true
else
    # Try common Android SDK locations
    AAPT2_PATH=""
    if [ -d "$HOME/Library/Android/sdk/build-tools" ]; then
        AAPT2_PATH=$(find "$HOME/Library/Android/sdk/build-tools" -name "aapt2" -type f | head -n 1)
    elif [ -d "$HOME/Android/Sdk/build-tools" ]; then
        AAPT2_PATH=$(find "$HOME/Android/Sdk/build-tools" -name "aapt2" -type f | head -n 1)
    fi
    
    if [ -n "$AAPT2_PATH" ]; then
        echo -e "${GREEN}[✓] aapt2 found at: $AAPT2_PATH${NC}"
        AAPT2_AVAILABLE=true
    else
        echo -e "${YELLOW}[✗] aapt2 not found${NC}"
        echo "   Make sure Android SDK Build Tools are installed"
        AAPT2_AVAILABLE=false
    fi
fi

echo ""

# Function to check manifest in AAB
check_aab_manifest() {
    local aab_path=$1
    
    if [ ! -f "$aab_path" ]; then
        echo -e "${RED}[✗] AAB file not found: $aab_path${NC}"
        return 1
    fi
    
    echo -e "${CYAN}Checking AAB file: $aab_path${NC}"
    echo ""
    
    # Create temp directory
    TEMP_DIR=$(mktemp -d)
    
    # Extract AAB (it's a ZIP file)
    echo "Extracting AAB to temporary directory..."
    unzip -q "$aab_path" -d "$TEMP_DIR" 2>/dev/null
    
    # Check base manifest
    MANIFEST_PATH="$TEMP_DIR/base/manifest/AndroidManifest.xml"
    
    if [ -f "$MANIFEST_PATH" ]; then
        echo -e "${GREEN}Found manifest in AAB${NC}"
        
        if grep -q "FOREGROUND_SERVICE_MEDIA_PROJECTION" "$MANIFEST_PATH"; then
            echo -e "${RED}[✗] PERMISSION FOUND IN AAB!${NC}"
            echo ""
            echo "Lines containing the permission:"
            grep "FOREGROUND_SERVICE_MEDIA_PROJECTION" "$MANIFEST_PATH" | sed 's/^/  /'
            rm -rf "$TEMP_DIR"
            return 1
        else
            echo -e "${GREEN}[✓] Permission NOT found in AAB manifest${NC}"
            rm -rf "$TEMP_DIR"
            return 0
        fi
    else
        echo -e "${YELLOW}[!] Could not find manifest in expected location${NC}"
        rm -rf "$TEMP_DIR"
        return 1
    fi
}

# Function to check manifest in APK
check_apk_manifest() {
    local apk_path=$1
    
    if [ ! -f "$apk_path" ]; then
        echo -e "${RED}[✗] APK file not found: $apk_path${NC}"
        return 1
    fi
    
    echo -e "${CYAN}Checking APK file: $apk_path${NC}"
    echo ""
    
    if [ "$AAPT2_AVAILABLE" = true ]; then
        if [ -n "$AAPT2_PATH" ]; then
            AAPT2_CMD="$AAPT2_PATH"
        else
            AAPT2_CMD="aapt2"
        fi
        
        OUTPUT=$($AAPT2_CMD dump badging "$apk_path" 2>&1)
        
        if echo "$OUTPUT" | grep -q "FOREGROUND_SERVICE_MEDIA_PROJECTION"; then
            echo -e "${RED}[✗] PERMISSION FOUND IN APK!${NC}"
            echo ""
            echo "Permission details:"
            echo "$OUTPUT" | grep "FOREGROUND_SERVICE_MEDIA_PROJECTION" | sed 's/^/  /'
            return 1
        else
            echo -e "${GREEN}[✓] Permission NOT found in APK${NC}"
            return 0
        fi
    else
        # Fallback: extract APK and check manifest
        echo "Extracting APK to check manifest..."
        TEMP_DIR=$(mktemp -d)
        unzip -q "$apk_path" -d "$TEMP_DIR" 2>/dev/null
        
        MANIFEST_PATH="$TEMP_DIR/AndroidManifest.xml"
        
        if [ -f "$MANIFEST_PATH" ]; then
            if grep -q "FOREGROUND_SERVICE_MEDIA_PROJECTION" "$MANIFEST_PATH"; then
                echo -e "${RED}[✗] PERMISSION FOUND IN APK!${NC}"
                rm -rf "$TEMP_DIR"
                return 1
            else
                echo -e "${GREEN}[✓] Permission NOT found in APK${NC}"
                rm -rf "$TEMP_DIR"
                return 0
            fi
        fi
        
        rm -rf "$TEMP_DIR"
        return 1
    fi
}

# Function to check source manifest
check_source_manifest() {
    MANIFEST_PATH="android/app/src/main/AndroidManifest.xml"
    
    if [ ! -f "$MANIFEST_PATH" ]; then
        echo -e "${RED}[✗] Source manifest not found: $MANIFEST_PATH${NC}"
        return 1
    fi
    
    echo -e "${CYAN}Checking source manifest: $MANIFEST_PATH${NC}"
    echo ""
    
    if grep -q 'FOREGROUND_SERVICE_MEDIA_PROJECTION.*tools:node="remove"' "$MANIFEST_PATH"; then
        echo -e "${GREEN}[✓] Removal directive found in source manifest${NC}"
        echo "   The permission should be removed during build"
        return 0
    elif grep -q "FOREGROUND_SERVICE_MEDIA_PROJECTION" "$MANIFEST_PATH"; then
        echo -e "${YELLOW}[!] Permission found but removal directive may be missing${NC}"
        echo ""
        echo "Lines containing the permission:"
        grep "FOREGROUND_SERVICE_MEDIA_PROJECTION" "$MANIFEST_PATH" | sed 's/^/  /'
        return 1
    else
        echo -e "${GREEN}[✓] Permission not found in source manifest${NC}"
        return 0
    fi
}

# Main execution
echo -e "${CYAN}Step 1: Checking source AndroidManifest.xml${NC}"
echo "----------------------------------------"
check_source_manifest
SOURCE_OK=$?
echo ""

if [ $SOURCE_OK -ne 0 ]; then
    echo -e "${YELLOW}[!] Source manifest needs fixing. Run: npx expo prebuild --clean${NC}"
    echo ""
fi

# Check for AAB or APK files
echo -e "${CYAN}Step 2: Checking built files${NC}"
echo "----------------------------------------"

# Find AAB files
AAB_FILE=$(find . -name "*.aab" -type f 2>/dev/null | head -n 1)
if [ -z "$AAB_FILE" ]; then
    AAB_FILE=$(find android/app/build/outputs/bundle/release -name "*.aab" -type f 2>/dev/null | head -n 1)
fi

# Find APK files
APK_FILE=$(find android/app/build/outputs/apk/release -name "*.apk" -type f 2>/dev/null | head -n 1)

if [ -z "$AAB_FILE" ] && [ -z "$APK_FILE" ]; then
    echo -e "${YELLOW}[!] No AAB or APK files found${NC}"
    echo "   Build your app first, then run this script again"
    echo ""
    echo "   To build:"
    echo "   - EAS: eas build --platform android --profile production"
    echo "   - Local: cd android && ./gradlew bundleRelease"
else
    if [ -n "$AAB_FILE" ]; then
        echo ""
        check_aab_manifest "$AAB_FILE"
    fi
    
    if [ -n "$APK_FILE" ]; then
        echo ""
        check_apk_manifest "$APK_FILE"
    fi
fi

echo ""
echo "========================================"
echo "Verification Complete"
echo "========================================"
echo ""
echo -e "${YELLOW}If permission was found:${NC}"
echo "  1. Run: npx expo prebuild --clean"
echo "  2. Rebuild your AAB/APK"
echo "  3. Run this script again to verify"
echo ""
echo -e "${GREEN}If permission was NOT found:${NC}"
echo "  ✓ Safe to upload to Google Play Console"
