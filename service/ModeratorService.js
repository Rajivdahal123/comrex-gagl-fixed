
export default class ModeratorService {
    constructor(axios) {
        this.axios = axios;
    }


    updateProfile(data) {

        return this.axios.put(`/moderators/${data.id}`, data);
    }

    getCodecInfo(data) {

        return this.axios.post('/users/getCodecInfo', data);
    }

    updatePassword(data) {

        return this.axios.put(`/moderators/resetPassword/${data.id}`, data);
    }
}
