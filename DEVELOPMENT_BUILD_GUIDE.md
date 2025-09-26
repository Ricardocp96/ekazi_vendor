# eKazi Vendor App - Development Build Guide

## Overview
This guide will help you create development builds for the eKazi Vendor app using Expo SDK 53, which allows testing on real devices.

## Prerequisites
1. Expo CLI installed globally: `npm install -g @expo/cli`
2. EAS CLI installed: `npm install -g eas-cli`
3. Expo account (free)
4. Apple Developer account (for iOS builds)
5. Google Play Console account (for Android builds)

## Setup Steps

### 1. Login to Expo
```bash
npx expo login
```

### 2. Configure EAS
```bash
eas build:configure
```

### 3. Create Development Build

#### For Android:
```bash
eas build --platform android --profile development
```

#### For iOS:
```bash
eas build --platform ios --profile development
```

#### For both platforms:
```bash
eas build --platform all --profile development
```

### 4. Install Development Build

#### Android:
1. Download the APK from the EAS build link
2. Enable "Install from Unknown Sources" on your device
3. Install the APK

#### iOS:
1. Download the IPA from the EAS build link
2. Install using TestFlight or direct installation

### 5. Run Development Server
```bash
npx expo start --dev-client
```

### 6. Connect Device
- Scan the QR code with your device's camera (iOS) or Expo Go app (Android)
- The app will load the development build and connect to your local server

## Development Workflow

### Making Changes
1. Edit your code
2. Save the file
3. The app will automatically reload with your changes

### Adding New Dependencies
```bash
npx expo install package-name
```

### Updating Dependencies
```bash
npx expo install --fix
```

## Troubleshooting

### Common Issues

#### Build Fails
- Check that all dependencies are compatible with SDK 53
- Run `npx expo install --fix` to update dependencies
- Check the EAS build logs for specific errors

#### App Won't Connect
- Ensure your device and computer are on the same network
- Check firewall settings
- Try using a tunnel connection: `npx expo start --tunnel`

#### Performance Issues
- Use release builds for performance testing
- Enable Hermes engine in app.json
- Optimize images and assets

### Debugging
- Use React Native Debugger
- Enable remote debugging on device
- Check Metro bundler logs

## Production Build

When ready for production:

```bash
# Create production build
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## Configuration Files

### app.json
- Contains app configuration
- Version and build numbers
- Permissions and plugins

### eas.json
- Build profiles
- Platform-specific settings
- Resource allocation

### package.json
- Dependencies
- Scripts
- Project metadata

## Best Practices

1. **Version Management**: Always increment version numbers before builds
2. **Testing**: Test on both platforms before releasing
3. **Dependencies**: Keep dependencies up to date
4. **Assets**: Optimize images and assets for mobile
5. **Performance**: Monitor app performance regularly

## Support

For issues with:
- Expo: https://docs.expo.dev/
- EAS Build: https://docs.expo.dev/build/introduction/
- React Native: https://reactnative.dev/docs/getting-started

## Notes

- SDK 53 requires React Native 0.79.5
- Development builds are larger than Expo Go builds
- Some native modules may require additional configuration
- Always test on real devices before releasing
