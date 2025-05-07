const user_repository = require('../repositories/user_repository')

class UserService {
    async UserRegister() {
        user_repository.CreateUser();
    }
}

module.exports = UserService;