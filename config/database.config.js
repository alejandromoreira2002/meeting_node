const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URI)
.then(db => console.log('Se conectó correctamente a la base de datos.'))
.catch(err => console.log('error: ', err))

module.exports = mongoose