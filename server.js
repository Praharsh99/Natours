const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION ??? Shutting Down...');
  console.log('Error Name: ' + err.name, '& Error Message: ' + err.message);

  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then((con) => console.log('Connection established!!!'));

const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
  console.log(`Server listening at ${port}......`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION ??? Shutting Down...');
  console.log('Error Name: ' + err.name, '& Error Message: ' + err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('🧨 SIGTERM RECEIVED. Shutting down gracefully.');
  server.close(() => {
    console.log('🔥 Process Terminated!!!');
  });
});
