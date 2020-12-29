const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const {User} = require('./models/User');

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extened:true}));

//application/json
app.use(bodyParser.json());



const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://@boiler-plate-node.inyzj.mongodb.net/boiler-plate-node?retryWrites=true&w=majority', {
    useNewUrlParser: true, useUnifiedTopology:true, useCreateIndex: true, useFindAndModify: false
}).then(()=>console.log('MongoDB Connected....'))
  .catch(err=>console.log(err))

app.get('/', (req, res) => res.send('새해복많이받으세요'))

app.post('/register', (req, res)=> {
  //회원 가입 할 때 필요한 정보들을 client에서 가져오면
  //해당 정보를 database에 넣어준다.

  const user = new User(req.body)

  user.save((err, userInfo) => {
    if(err) return res.json({success: false, err})
    return res.status(200).json({
      success: true
    })
  })

})



app.listen(port, () => console.log('Example app listening on port ${port}!'))

// mongodb+srv://dbUser:<password>@boiler-plate-node.inyzj.mongodb.net/test