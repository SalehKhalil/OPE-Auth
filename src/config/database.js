const { STRING_CONNECTION } = process.env
const mongoose = require('mongoose')

mongoose.connect(
  STRING_CONNECTION,
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  }
)

mongoose.connection.on('error', err => console.error(err))
mongoose.connection.on('open', () => console.log('Connected to mongo server.'))
