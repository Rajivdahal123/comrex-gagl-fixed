const key = 'auth_token';

export default class AuthService {

    constructor(axios) {
        this.axios = axios;
    }

    getToken() {
        return localStorage.getItem(key);
    }

    setToken(value) {
        return localStorage.setItem(key, value);
    }

    async login({ username, password }) {
        return this.axios.post('/auth/login', { username,
            password });
    }

    async requestResetPass(email) {
        return this.axios.post('/auth/request-resetpass', { email });
    }
}
