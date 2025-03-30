const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/app.js',  // Relative to monthly-budget-pwa folder
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public')  // Output to monthly-budget-pwa/public
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  }
};

// If this is meant for package.json, move it there. Otherwise, remove it.