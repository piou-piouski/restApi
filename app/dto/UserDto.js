class UserDto{
    static create(incommingData){
        return {
            email: incommingData.email,
            password: incommingData.password
        }
    }
}

module.exports = UserDto