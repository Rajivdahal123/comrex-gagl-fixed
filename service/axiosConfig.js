const { jitsiLocalStorage } = require('@jitsi/js-utils/jitsi-local-storage');
const axios = require('axios');

const domain = process.env.REACT_APP_DOMAIN || 'http:localhost:4000/api';

export const axiosInstance = axios.create({
    baseURL: domain,
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosInstance.interceptors.request.use(config => {
    const accessToken = jitsiLocalStorage.getItem('auth_token');

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

const refreshToken = () => {
    const rfToken = jitsiLocalStorage.getItem('refreshToken');

    return fetch(`${domain}/auth/refresh-token/${rfToken}`, {
        method: 'GET'
    });
};

axiosInstance.interceptors.response.use(response => response, async error => {
    const config = error.config;

    if (error.response && error.response.status === 401) {
        const res = await refreshToken().then(resp => resp.json());


        if (res.accessToken) {
            jitsiLocalStorage.setItem('auth_token', res.accessToken);

            // jitsiLocalStorage.setItem('refreshToken', res.data.refreshToken);
        }

        return axiosInstance(config);
    }

    return Promise.reject(error);
});
