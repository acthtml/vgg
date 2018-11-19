module.exports = api => {
  api.cache(true);
  return {
    "presets": [
      [
        "@babel/preset-env",
        {
          "modules": false,
          "useBuiltIns": "usage",
          "targets": {
            "browsers": [
              "> 1%",
              "last 2 versions",
              "not ie <= 8"
            ],
            "node": "current"
          }
        }
      ]
    ],
    "plugins": [
      "@babel/plugin-proposal-object-rest-spread",
      "@babel/plugin-syntax-dynamic-import",
      "@babel/plugin-transform-async-to-generator",
      "@babel/plugin-transform-runtime",
    ]
  }
}
