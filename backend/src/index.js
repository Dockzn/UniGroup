const express = require('express')
const cors = require('cors');
require('dotenv').config()

const app = express()
const authRoutes = require('./routes/authRoutes')
const teamRoutes = require('./routes/teamRoutes')
const projectRoutes = require('./routes/projectRoutes')

// Middleware global
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)

app.use('/api/teams', teamRoutes)
app.use('/api/projects', projectRoutes)

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({message: 'Erro inesperado'})
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})