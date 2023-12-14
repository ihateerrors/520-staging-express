# STOP AND READ AS THIS BRANCH IS OUT OF DATE!! </br>USE 'prod' AS THE NEW SOURCE OF TRUTH

# Welcome to the sr520 construction project
<a href="https://sr520construction.com/">https://sr520construction.com/</a>

This is an express application using mongo db hosted on Azure.

## Local development
- Clone the 'prod' branch
- You will need someone from the Azure team to give your the variables and respective keys (within a .env file) to properly run the application locally.
- You will also need someone with history on this project to give you credentials for the dashboard for testing of new construction updates.

### From root: 
- nvm use v20
- npm install
- run 'node server.js'

## Branching
### 'main-new' is no longer to be used since launch
new-branch > stage > prod

## Deployment
- Any merge or push to the stage branch will trigger deployment to staging
- Any merge or push to the prod branch will trigger deployment to production
- Staging and production have separate databases
