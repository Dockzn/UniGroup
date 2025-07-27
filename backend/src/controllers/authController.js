const db = require('../../sequelize/models/index');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const authController = {
    register: async (req, res) => {
        try{
            const { name, email, password} = req.body

            const userExists = await db.User.findOne({where: {email}})
            if(userExists){
                return res.status(400).json({ message: 'Email já cadastrado!'})
            }

            const hashPassword = await bcrypt.hash(password, 10)

            const user = await db.User.create({
                name,
                email,
                password: hashPassword
            })

            res.status(201).json({
                message: 'Usuário criado com sucesso!',
                userId: user.Id
            })

        }catch (error){
            console.error(`Erro no registro: ${error}`)
            res.status(500).json({ message: 'Erro ao criar usuário', error: error.message })
        }
    },
    login: async (req, res) => {
        try{
            const {email, password} = req.body

            const user = await db.User.findOne({where: {email}})
            if(!user){
                return res.status(400).json({message: 'Credenciais inválidas!'})
            }

            const validPassword = await bcrypt.compare(password, user.password)
            if(!validPassword){
                return res.status(400).json({message: 'Credenciais inválidas'})
            }

            const token = jwt.sign(
                {userId: user.id},
                process.env.JWT_SECRET,
                {expiresIn: '24h'}
            )

            res.json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            })

        }catch (error){
            console.error(`Erro no login: ${error}`)
            res.status(500).json({ message: 'Erro ao autenticar usuário', error: error.message })
        }
    }
}

module.exports = authController