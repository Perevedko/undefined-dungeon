var path = require('path');

module.exports = {
    entry: {
        'css': './client/style.css'
    },

    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },

    module: {
        rules: [
            {
                test: /\.сss$/,
                use: 'raw-loader'
            }
        ]
    }
};