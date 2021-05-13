module.exports = function(api) {
  api.cache(true);
  return {
    "presets": [
      [
        "@babel/preset-env",
        {
          "modules": false,
          "targets": {
            "ie": "9"
          },
          "loose": true
        }
      ]
    ],
    "plugins": [
      [
        "@babel/plugin-proposal-class-properties",
        {
          "loose": true
        }
      ],
      "@babel/plugin-proposal-export-namespace-from",
      "@babel/plugin-proposal-object-rest-spread"
    ]
  };
};
