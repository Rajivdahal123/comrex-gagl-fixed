import AuthService from './AuthService';
import MeetingService from './MeetingService';
import ModeratorService from './ModeratorService';
import { axiosInstance } from './axiosConfig';

export const authService = new AuthService(axiosInstance);
export const meetingService = new MeetingService(axiosInstance);
export const moderatorService = new ModeratorService(axiosInstance);

