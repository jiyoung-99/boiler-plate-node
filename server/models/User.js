const mongoose = require('mongoose');
//bcrypt 가져온다.
const bcrypt = require('bcrypt');
//salt를 이용해서 비밀번호를 암호화, salt를 먼저 생성해야한다. 10자리인 salt를 이용해서 비밀번호를 암호화한다.
const saltRounds = 10;
const jwt = require('jsonwebtoken');


const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength:50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

//userModel에 유저 정보를 저장하기 전에 'save'를 하겠다 라는 뜻
userSchema.pre('save', function( next ) {

    var user = this;

    if(user.isModified('password')){

        //비밀번호를 암호화 시킨다.
        bcrypt.genSalt(saltRounds, function(err, salt) {
    
    
            if(err) return next(err)
    
            bcrypt.hash(user.password, salt, function(err, hash) {
                // Store hash in your password DB.
                if(err) return next(err)
                user.password = hash
                next()
                
            });
    
        });
    } else {
        next()
    }

})

userSchema.methods.comparePassword = function(plainPassword, cb) {

    //plain password = 1234567
    //암호화된 비밀번호 : $23233842394234~~~~
    //plainpassword를 암호화 해서 비번과 맞는지 체크
    bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
        if(err) return cb(err)

        cb(null, isMatch)
    })
    
}

userSchema.methods.generateToken = function(cb) {

    var user = this;

    //jsonWebToken을 이용해서 token을 생성하기
    var token = jwt.sign(user._id.toHexString(), 'secretToken')

    // user._id + 'secretToken' = token
    user.token = token
    user.save(function(err, user) {
        if(err) return cb(err)
        cb(null, user)
    })

}

userSchema.statics.findByToken = function(token, cb) {
    var user = this;

    //user._id + '' = token

    //토큰을 decode 한다.
    jwt.verify(token, 'secretToken', function(err, decoded) {
        //유저 아이디를 이용해서 유저를 찾은 다음에
        //클라이언트에서 가져온 토큰과 데이터베이스에 보관된 토큰이 일치하는지 확인

        user.findOne({ "_id": decoded, "token": token },function(err, user) {
                if(err) return cb(err)

                cb(null, user)
            })

    })




}

const User = mongoose.model('User', userSchema)

module.exports = {User}