const { withAndroidManifest } = require('@expo/config-plugins');

// Permissions we want to strip to satisfy Google Play media policy
const PERMISSIONS_TO_REMOVE = [
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.WRITE_EXTERNAL_STORAGE',
  'android.permission.READ_MEDIA_IMAGES',
  'android.permission.READ_MEDIA_VIDEO',
  'android.permission.READ_MEDIA_VISUAL_USER_SELECTED', // Android 14+ granular permission
  'android.permission.READ_MEDIA_AUDIO', // not needed; avoid extra scrutiny
  // RECORD_AUDIO is needed for Agora voice calls, so we keep it
  'android.permission.ACCESS_COARSE_LOCATION', // we only want fine location
  'android.permission.SYSTEM_ALERT_WINDOW', // avoid overlay permission
  'android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION', // avoid unnecessary screen-capture FGS permission added by dependencies (e.g., SDKs with screen sharing)
];

const TOOLS_NAMESPACE = 'http://schemas.android.com/tools';

const ensureToolsNamespace = (manifest) => {
  if (!manifest.$) {
    manifest.$ = {};
  }
  if (!manifest.$['xmlns:tools']) {
    manifest.$['xmlns:tools'] = TOOLS_NAMESPACE;
  }
};

const createRemovalNodes = (permissions) =>
  permissions.map((permission) => ({
    $: {
      'android:name': permission,
      'tools:node': 'remove',
    },
  }));

const stripEntries = (entries = []) =>
  entries.filter(
    (entry) =>
      entry?.$ &&
      entry.$['tools:node'] !== 'remove' &&
      !PERMISSIONS_TO_REMOVE.includes(entry.$['android:name'])
  );

// Remove permission from manifest array, ensuring it's completely removed
const removePermissionFromArray = (permissionsArray, permissionName) => {
  if (!Array.isArray(permissionsArray)) {
    return permissionsArray;
  }
  
  return permissionsArray.filter((entry) => {
    if (!entry?.$ || !entry.$['android:name']) {
      return true; // Keep entries without name
    }
    // Remove if it matches the permission we want to remove
    return entry.$['android:name'] !== permissionName;
  });
};

module.exports = function withStrippedMediaPermissions(config) {
  // First, ensure tools namespace and add removal nodes
  config = withAndroidManifest(config, (configWithManifest) => {
    const manifest = configWithManifest.modResults?.manifest;
    if (!manifest) {
      return configWithManifest;
    }

    ensureToolsNamespace(manifest);

    // Remove permissions from uses-permission array
    if (manifest['uses-permission']) {
      PERMISSIONS_TO_REMOVE.forEach((permission) => {
        manifest['uses-permission'] = removePermissionFromArray(
          manifest['uses-permission'],
          permission
        );
      });
      
      // Add removal nodes to ensure they're removed during merge
      const removalNodes = createRemovalNodes(PERMISSIONS_TO_REMOVE);
      manifest['uses-permission'] = [
        ...stripEntries(manifest['uses-permission']),
        ...removalNodes,
      ];
    }

    // Handle uses-permission-sdk-23
    if (manifest['uses-permission-sdk-23']) {
      PERMISSIONS_TO_REMOVE.forEach((permission) => {
        manifest['uses-permission-sdk-23'] = removePermissionFromArray(
          manifest['uses-permission-sdk-23'],
          permission
        );
      });
      
      const removalNodes = createRemovalNodes(PERMISSIONS_TO_REMOVE);
      manifest['uses-permission-sdk-23'] = [
        ...stripEntries(manifest['uses-permission-sdk-23']),
        ...removalNodes,
      ];
    }

    // Drop requestLegacyExternalStorage if present
    if (manifest.application?.[0]?.$?.['android:requestLegacyExternalStorage']) {
      delete manifest.application[0].$['android:requestLegacyExternalStorage'];
    }

    return configWithManifest;
  });

  return config;
};

