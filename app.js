const express = require('express')
const bodyParser = require('body-parser')
const jsonwebtoken = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const uuid = require('uuid-random')
require('dotenv').config()

const PORT = process.env.PORT || 3000
const User = require('./models/users.js')
const { sessionKey } = require('./config/session.config.js')
const { getPrivateKey } = require('./config/keys.config.js')

const generate = (privateKey, { id, name, email, avatar, appId, kid, mod }) => {
    const now = new Date()
    const jwt = jsonwebtoken.sign({
      aud: 'jitsi',
      context: {
        user: {
          id,
          name,
          avatar,
          email: email,
          moderator: mod
        },
        features: {
          livestreaming: 'true',
          recording: 'true',
          transcription: 'true',
          "outbound-call": 'true'
        }
      },
      iss: 'chat',
      room: '*',
      sub: appId,
      exp: Math.round(now.setHours(now.getHours() + 3) / 1000),
      nbf: (Math.round((new Date).getTime() / 1000) - 10)
    }, privateKey, { algorithm: 'RS256', header: { kid } })
    return jwt;
}

const verificarToken = (req, res, next) => {
    const token = req.headers['authorization'];
  
    if (!token) {
        return res.status(403).json({ mensaje: 'Token no proporcionado', status: 403 });
    }
  
    jsonwebtoken.verify(token, getPrivateKey(), (err, decoded) => {
      if (err) {
        return res.status(401).json({ mensaje: 'Token inválido', status: 401 });
      }
  
      req.user = decoded;
      next();
    });
}

const checkSignIn = (req, res, next) => {
    if(req.session.id_user && req.session.username && req.session.email){
        next()
    } else {
        res.redirect('/user/login')
    }
}

const checkSignOut = (req, res, next) => {
    if(req.session.id_user && req.session.username && req.session.email){
        res.redirect('/')
    } else {
        next()
    }
}

const app = express()

app.set('views','./views')
app.set('view engine', 'ejs')

app.use('/public', express.static('public'))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(
    session({
        secret: sessionKey,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    })
);


app.get('/', checkSignIn, (req, res) => {
    let username = req.session.username
    res.render('index', {username: username})
})

/*************************************[USERS ENDPOINTS]*************************************/
app.get('/user/login', checkSignOut, (req, res) => {
    res.render('login');
})

app.post('/user/login', (req, res) => {
    let email = req.body.email;
    let pwd = req.body.password;

    User.find({email: email, password: pwd})
    .then((data) => {
        if(data.length > 0){
            const {_id, username, email} = data[0];

            // Se crea una sesion
            req.session.id_user = _id
            req.session.username = username
            req.session.email = email

            // Se crea el Token
            let privateKey = getPrivateKey();
            const token = generate(privateKey, {
                id: uuid(),
                name: username,
                email: email,
                avatar: "",
                appId: "vpaas-magic-cookie-16adeb346a2f47589db75f5c97b524fb",
                kid: "vpaas-magic-cookie-16adeb346a2f47589db75f5c97b524fb/bdf12f",
                mod: "false"
            });

            res.status(200).json({text: "Acceso correcto", token, status: 200})
        }else{
            res.status(401).json({text: "El usuario no se encuentra registrado", status: 401})
        }
    })
    .catch((err) => {
        res.status(401).json({text: `Hubo un problema al procesar la solicitud. Error: ${err}`, status: 401})
    })
})

app.get('/user/signup', checkSignOut, (req, res) => {
    res.render('signup');
})

app.post('/user/signup', (req, res) => {
    let username = req.body.username;
    let email = req.body.email;
    let pwd = req.body.password;

    console.log({username, email, pwd})

    let user = new User({
        username: username,
        email: email,
        password: pwd
    })

    user.save()
    .then((data) => {
        const {_id, username, email} = data

        // Se crea una sesion
        req.session.id_user = _id
        req.session.username = username
        req.session.email = email

        // Se crea el Token
        let privateKey = getPrivateKey();
        const token = generate(privateKey, {
            id: uuid(),
            name: username,
            email: email,
            avatar: "",
            appId: "vpaas-magic-cookie-16adeb346a2f47589db75f5c97b524fb",
            //kid: "vpaas-magic-cookie-16adeb346a2f47589db75f5c97b524fb/586d4c",
            kid: "vpaas-magic-cookie-16adeb346a2f47589db75f5c97b524fb/bdf12f",
            mod: "false"
        });

        res.status(200).json({text: "Usuario registrado correctamente.", token, status: 200})
    })
    .catch((err) => {
        res.status(401).json({text: `Hubo un problema al registrar el usuario. Error: ${err}`, status: 401})
    })
})

app.get('/user/logout', checkSignIn, (req, res) => {
    req.session.destroy(() => {
        console.log("El usuario cerro su sesion")
    });
    res.redirect('/user/login');
})
/********************************************************************************************/

/*************************************[MEETING ROOM ENDPOINTS]****************************/
app.get('/meeting/room/:roomname', checkSignIn, (req, res) => {
    res.render('meetingroom', {roomname: req.params.roomname});
})

app.post('/meeting/room', verificarToken, (req, res) => {
    const token = req.headers['authorization'];
    console.log(req.user);
    res.status(200).json({text: "Usuario con permiso para entrar a la reunión", token, status: 200})
})

app.post('/meeting/create', (req, res) => {
    const {username, email} = req.session

    let privateKey = getPrivateKey();
    const token = generate(privateKey, {
        id: uuid(),
        name: username,
        email: email,
        avatar: "",
        appId: "vpaas-magic-cookie-16adeb346a2f47589db75f5c97b524fb",
        kid: "vpaas-magic-cookie-16adeb346a2f47589db75f5c97b524fb/bdf12f",
        mod: "true"
    });
    res.status(200).json({text: "Reunion creada", token, status: 200})
})

app.post('/meeting/join', (req, res) => {
    const {username, email} = req.session

    let privateKey = getPrivateKey();
    const token = generate(privateKey, {
        id: uuid(),
        name: username,
        email: email,
        avatar: "",
        appId: "vpaas-magic-cookie-16adeb346a2f47589db75f5c97b524fb",
        kid: "vpaas-magic-cookie-16adeb346a2f47589db75f5c97b524fb/bdf12f",
        mod: "false"
    });
    res.status(200).json({text: "Reunion verificada", token, status: 200})
})
/********************************************************************************************/

// APIs TEST
app.get('/api/users', (req, res) => {
    User.find({})
    .then((data) => {
        res.json({datos: data})
    })
    .catch((err) => {
        res.json({error: err})
    })
})

app.get('/api/token', (req, res) => {
    let privateKey = getPrivateKey();
    const token = generate(privateKey, {
        id: uuid(),
        name: "usuario",
        email: "usuario@example.com",
        avatar: "",
        appId: "vpaas-magic-cookie-16adeb346a2f47589db75f5c97b524fb",
        kid: "vpaas-magic-cookie-16adeb346a2f47589db75f5c97b524fb/bdf12f",
        mod: "false"
    });
    res.status(200).json({text: "Token recibido", token, status: 200})
})


app.listen(PORT, () => {
    console.log('Servidor activo')
})