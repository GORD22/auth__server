const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');
const userModel = require('../models/user-model');

class UserService {
    async signup(email, password) {
        const candidate = await UserModel.findOne({email});
        if (candidate) {
            throw ApiError.BadRequest(`Пользователь с почтовым адресом: ${email} уже существует`);
        }
        const hashPassord = await bcrypt.hash(password, 3); 

        const user = await UserModel.create({email, password: hashPassord});

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});

        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto}
    }

    async signin(email, password) {
        const user = await UserModel.findOne({email});
        if (!user) {
            throw ApiError.BadRequest('Пользователь с таким email не найден');
        }

        const isPassEquals = await bcrypt.compare(password, user.password);
        if (!isPassEquals) {
            throw ApiError.BadRequest('Пароль не верный');
        }

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto};
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async me(id) {
        const user = await UserModel.findById(id);
        let arr = [];
        arr.push(user);
        
        return arr;
    }

    async getAllUsers() {
        const users = await UserModel.find();
        return users;
    }

    async getUser(id) {
        const user = await UserModel.findById(id);
        if (!user) {
            throw ApiError.BadRequest('Пользователь не найден');
        }
        let arr = [];
        arr.push(user);
        
        return arr;
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }

        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);
        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }

        const user = await UserModel.findById(userData.id);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto};
    }
}

module.exports = new UserService();