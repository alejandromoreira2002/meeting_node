const fs = require('fs')

const getPrivateKey = () => {
    let privKey = fs.readFileSync('./config/keys/Key 17_1_2024, 2_24_04 p. m..pk');
    return privKey
}

const getPublicKey = () => {
    let pubKey = fs.readFileSync('./config/keys/Key 17_1_2024, 2_24_04 p. m..pub');
    return pubKey
}

module.exports = {
    getPrivateKey: getPrivateKey,
    getPublicKey: getPublicKey
}