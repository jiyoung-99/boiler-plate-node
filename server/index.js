const express = require('express')
const app = express()

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const {User} = require('./models/User');
const {auth} = require('./middleware/auth');
//컨피그에 넣은 환경설정 정보들
const config = require('./config/key')

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extened:true}));

//application/json
app.use(bodyParser.json());

//cookie parser
app.use(cookieParser());


const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology:true, useCreateIndex: true, useFindAndModify: false
}).then(()=>console.log('MongoDB Connected....'))
  .catch(err=>console.log(err))

app.get('/', (req, res) => res.send('새해복많이받으세요'))

//회원가입
app.post('/api/register', (req, res)=> {
  //회원 가입 할 때 필요한 정보들을 client에서 가져오면
  //해당 정보를 database에 넣어준다.

  const user = new User(req.body)

  user.save((err, userInfo) => {
    if(err) {
      console.log('index.js is err : ', err)

      return res.json({success: false, err})
    }
    
      
    return res.status(200).json({
      success: true
    })
  })

})

//로그인
app.post('/api/users/login', (req, res) => {
  console.log('req : ', req)
  //요청된 이메일이 데이터베이스에 있는지 확인
  User.findOne({ email:req.body.email }, (err, user) => {
    //user 가 없다면 res.json으로 loginSuccess 가 false가 된다.
    if(!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다."
      })
    }

    //요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인
    user.comparePassword(req.body.password , ( err, isMatch ) => {
      if(!isMatch)
      return res.json({loginSuccess: false, message: "비밀번호가 틀렸습니다."})

      user.generateToken((err, user) => {
        if(err) return res.status(400).send(err);

        // 토큰을 저장한다. 어디에? 쿠키, 로컬스토리지
        //npm install cookie-parser --save 
        res.cookie('x_auth', user.token)
        .status(200)
        .json({loginSuccess:true, userId:user._id})

      })

    });

  });

  //비밀번호까지 맞다면 토큰 생성


})

app.get('/api/users/auth', auth, ( req, res ) => {

  // 여기 까지 미들웨어를 통과해 왔다는 얘기는 Authentication 이 True 라는 것
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth:true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image

  })

  
  
})

app.get('/api/users/logout', auth, ( req, res ) => {

  User.findOneAndUpdate({_id: req.user._id }, {token: ""}, (err, user) => {
    if(err) return res.json({success:false, err})
    return res.status(200).send({
      success:true
    })
  })

})

app.get('/api/hello', (req, res) => {
  
  
  
  res.send('안녕하세요 ~ ')
})



const port = 5000
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

// mongodb+srv://dbUser:<password>@boiler-plate-node.inyzj.mongodb.net/test

//npm install dcrypt --save
//npm install jsonwebtoken --save