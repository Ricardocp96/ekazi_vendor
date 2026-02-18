const { withAppBuildGradle } = require('@expo/config-plugins');

const BLOCK = `configurations.all {
    exclude group: 'com.android.support', module: 'support-compat'
    exclude group: 'com.android.support', module: 'support-media-compat'
}`;

module.exports = function withAndroidSupportExclusions(config) {
  return withAppBuildGradle(config, config => {
    const { modResults } = config;
    if (modResults.language !== 'groovy') {
      return config;
    }

    if (modResults.contents.includes(BLOCK)) {
      return config;
    }

    const pattern = /dependencies\s*\{/;
    if (pattern.test(modResults.contents)) {
      modResults.contents = modResults.contents.replace(
        pattern,
        `${BLOCK}\n\n$&`
      );
      return config;
    }

    modResults.contents += `\n${BLOCK}\n`;
    return config;
  });
};

