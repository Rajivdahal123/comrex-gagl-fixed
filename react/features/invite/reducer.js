// @flow

import { ReducerRegistry } from '../base/redux';

import {
    ADD_PENDING_INVITE_REQUEST,
    REMOVE_PENDING_INVITE_REQUESTS, SAVE_INVITED_PEOPLE,
    SET_CALLEE_INFO_VISIBLE,
    UPDATE_DIAL_IN_NUMBERS_FAILED,
    UPDATE_DIAL_IN_NUMBERS_SUCCESS,
    HIDE_EDIT_PROFILE_DIALOG,
    HIDE_EDIT_SECURITY_DIALOG
} from './actionTypes';
import logger from './logger';

const DEFAULT_STATE = {
    /**
     * The indicator which determines whether (the) {@code CalleeInfo} is
     * visible.
     *
     * @type {boolean|undefined}
     */
    calleeInfoVisible: false,
    numbersEnabled: true,
    numbersFetched: false,
    pendingInviteRequests: [],
    invitedUserList: [],
    guestName: '',
    userEmail: '',
    alertState: ''
};

ReducerRegistry.register('features/invite', (state = DEFAULT_STATE, action) => {
    switch (action.type) {
        case SAVE_INVITED_PEOPLE:
            return {
                ...state,
                invitedUserList: state.invitedUserList.concat(action.members)
            };
        case ADD_PENDING_INVITE_REQUEST:
            return {
                ...state,
                pendingInviteRequests: [
                    ...state.pendingInviteRequests,
                    action.request
                ]
            };

        case REMOVE_PENDING_INVITE_REQUESTS:
            return {
                ...state,
                pendingInviteRequests: []
            };

        case SET_CALLEE_INFO_VISIBLE:
            return {
                ...state,
                calleeInfoVisible: action.calleeInfoVisible,
                initialCalleeInfo: action.initialCalleeInfo
            };

        case UPDATE_DIAL_IN_NUMBERS_FAILED:
            return {
                ...state,
                error: action.error
            };

        case UPDATE_DIAL_IN_NUMBERS_SUCCESS: {
            if (Array.isArray(action.dialInNumbers)) {
                return {
                    ...state,
                    conferenceID: action.conferenceID,
                    numbers: action.dialInNumbers,
                    numbersEnabled: true,
                    numbersFetched: true
                };
            }

            // this is the old format which is deprecated
            logger.warn('Using deprecated API for retrieving phone numbers');

            const { numbersEnabled } = action.dialInNumbers;

            return {
                ...state,
                conferenceID: action.conferenceID,
                numbers: action.dialInNumbers,
                numbersEnabled,
                numbersFetched: true
            };
        }

        case HIDE_EDIT_PROFILE_DIALOG:
            return {
                ...state,
                alertState: 'profile'
            }
        
        case HIDE_EDIT_SECURITY_DIALOG:
            return {
                ...state,
                alertState: 'security'
            }
    }

    return state;
});
