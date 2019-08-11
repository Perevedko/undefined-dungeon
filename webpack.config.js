var path = require('path');

module.exports = {
    entry: {
        'html': './client/index.html',
        'css': './client/style.css'
    },

    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    
    module: {
        rules: [
            {
                test: /\.html$/,
                use: {
                    loader: 'html-loader'
                }
            },

            {
                test: /\.сss$/,
                use: 'raw-loader'
            }
        ]
    }
};