require('dotenv').config();
require('express-async-errors');

// extra security packages
const helmet = require('helmet')//adds security headers to protect site
const cors = require('cors')  //makes the resources from this server accessible to other domains(front end apps)
const xss = require('xss-clean') //santises the user input to prevent cross site scripting attacks
const rateLimiter = require('express-rate-limit') // limits the num of requests a user can send

// packages for documentation
const swaggerUI = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDocument = YAML.load('./swagger.yaml')

const express = require('express');
const app = express();

const authenticateUser = require('./middleware/authentication')


// connectDB
const connectDB = require('./db/connect')

// routers
const authRouter = require('./routes/auth')
const jobsRouter = require('./routes/jobs')


// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');


app.set('trust proxy', 1) //required to be set if behind a reverse proxy like heroku
app.use(rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 100, // limit each IP to 100 requests per windowMs
}))
app.use(express.json());
app.use(helmet())
app.use(cors())
app.use(xss())
// extra packages

app.get('/',(req, res)=>{
  res.send('<h1>Jobs API</h1><a href="/api-docs">Documentation</a>')
})

// sets up swagger documentation, exported files from postman, edited on apimatic, exported 
// as yaml, edited on swaggerjs editor, then stored the file as swagger.yaml
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))

// routes
app.use('/api/v1/auth', authRouter )
app.use('/api/v1/jobs', authenticateUser, jobsRouter )

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
