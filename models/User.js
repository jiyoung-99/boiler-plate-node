const mongoose = require('mongoose');
//bcrypt 가져온다.
const bcrypt = require('bcrypt')
//salt를 이용해서 비밀번호를 암호화, salt를 먼저 생성해야한다. 10자리인 salt를 이용해서 비밀번호를 암호화한다.
const saltRounds = 10


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
    }

})


const User = mongoose.model('User', userSchema)

module.exports = {User}