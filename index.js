const express = require('express')
const hbs = require('express-handlebars')
const pool = require('./db')
require('dotenv').config();
const app = express()

app.use(express.urlencoded({ extended:true }))
app.use(express.json())


app.engine('handlebars', hbs.engine({
    helpers: {
        eq: (a, b) => a === b
    }
}));

app.set('view engine', 'handlebars')
app.set('views', './views')

app.use(express.static('public'))


app.use((req, res, next) => {
    res.locals.currentRoute = req.path
    next()
})

app.get('/', (req, res) => {
    res.render('home', { css: 'home' })
})

app.get('/alunos', (req, res) => {
    const query = `SELECT * FROM infoalunos`
    
    pool.query(query, (error, dados) => {
        if (error) console.log(error)
        res.render('alunos', { css: 'alunos', dados })
    })
})

app.get('/cadastrar', (req, res) => {
    res.render('cadastrar', { css: 'cadastrar' })
})

app.post('/cadastrar', (req, res) => {
    const { nome, telefone, email } = req.body
    const query = `INSERT INTO infoalunos (nome, telefone, email) VALUE (?, ?, ?)`

    pool.query(query, [nome, telefone, email], (error) => {
        if (error) console.log(error)
    })

    res.redirect('/alunos')
})

app.get('/editar/:id', (req, res) => {
    const { id } = req.params

    pool.query("SELECT * FROM infoalunos WHERE id = ?", [id], (erro, dados) => {
        if (erro) throw erro

        const aluno = dados[0]
        res.render('editar', { aluno, css: 'editar' })
    })
})

app.post('/editar/:id', (req, res) => {
    const { id } = req.params
    const { nome, telefone, email } = req.body
    const query = `UPDATE infoalunos SET nome=?, telefone=?, email=? WHERE id=?`

    pool.query(query, [nome, telefone, email, id], (error) => {
        if (error) console.log(error)
    })

    res.redirect('/alunos')
})

app.get('/deletar/:id', (req, res) => {
    const { id } = req.params
    const query = `DELETE FROM infoalunos WHERE id=?`

    pool.query(query, [id], (error) => {
        if (error) console.log(error)
    })

    res.redirect('/alunos')
})

app.listen(process.env.PORT || 4000, () => {
    console.log('Servidor rodando...')
})
