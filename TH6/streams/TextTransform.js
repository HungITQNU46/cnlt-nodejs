const { Transform } = require('stream');

class TextTransform extends Transform {
    _transform(chunk, encoding, callback) {
        const upperCase = chunk.toString().toUpperCase();
        callback(null, upperCase);
    }
}

module.exports = TextTransform;