export default class MeetingService {

    constructor(axios) {
        this.axios = axios;
    }

    createMeeting(data) {
        return this.axios.post('/meeting', data);
    }

    updateMembers(meeting_code, { members_add, members_remove }) {
        return this.axios.put(`/meeting/${meeting_code}/update-members`, { members_add,
            members_remove });
    }

    updateCodec(meeting_code, codec) {
        return this.axios.put(`/meeting/${meeting_code}/update-codec`, { codec });
    }

    getMeeting(meeting_code) {
        return this.axios.get(`/meeting/${meeting_code}`);
    }

    getMember(meeting_code, token) {
        return this.axios.get(`/meeting/${meeting_code}/member?token=${token}`);
    }
}
