// @flow

import { jitsiLocalStorage } from '@jitsi/js-utils/jitsi-local-storage';
import type { Dispatch } from 'redux';

import { meetingService } from '../../../service';
import { getInviteURL } from '../base/connection';
import { getLocalParticipant, getParticipants } from '../base/participants';
import { inviteVideoRooms } from '../videosipgw';

import {
    ADD_PENDING_INVITE_REQUEST,
    BEGIN_ADD_PEOPLE,
    HIDE_ADD_PEOPLE_DIALOG,
    REMOVE_PENDING_INVITE_REQUESTS,
    SET_CALLEE_INFO_VISIBLE,
    UPDATE_DIAL_IN_NUMBERS_FAILED,
    UPDATE_DIAL_IN_NUMBERS_SUCCESS,
    SAVE_INVITED_PEOPLE,
    BEGIN_EDIT_PROFILE,
    HIDE_EDIT_PROFILE_DIALOG,
    BEGIN_EDIT_SECURITY,
    HIDE_EDIT_SECURITY_DIALOG
} from './actionTypes';
import {
    getDialInConferenceID,
    getDialInNumbers,
    invitePeopleAndChatRooms,
    inviteSipEndpoints
} from './functions';
import logger from './logger';

/**
 * Creates a (redux) action to signal that a click/tap has been performed on
 * {@link InviteButton} and that the execution flow for adding/inviting people
 * to the current conference/meeting is to begin.
 *
 * @returns {{
 *     type: BEGIN_ADD_PEOPLE
 * }}
 */
export function beginAddPeople(roomId, isCodec, isInvite, isAddNumber) {
    return {
        type: BEGIN_ADD_PEOPLE,
        roomId,
        isCodec,
        isInvite,
        isAddNumber
    };
}

export function sendIntoUserList(members) {
    return dispatch => {
        dispatch({
            type: SAVE_INVITED_PEOPLE,
            members
        });
    };
}

/**
 * Creates a (redux) action to signal that the {@code AddPeopleDialog}
 * should close.
 *
 * @returns {{
 *     type: HIDE_ADD_PEOPLE_DIALOG
 * }}
 */
export function hideAddPeopleDialog() {
    return {
        type: HIDE_ADD_PEOPLE_DIALOG
    };
}


/**
 * Invites (i.e. Sends invites to) an array of invitees (which may be a
 * combination of users, rooms, phone numbers, and video rooms.
 *
 * @param  {Array<Object>} invitees - The recipients to send invites to.
 * @param  {Array<Object>} showCalleeInfo - Indicates whether the
 * {@code CalleeInfo} should be displayed or not.
 * @returns {Promise<Array<Object>>} A {@code Promise} resolving with an array
 * of invitees who were not invited (i.e. Invites were not sent to them).
 */
export function invite(
        invitees: Array<Object>,
        showCalleeInfo: boolean = false) {

    return (
            dispatch: Dispatch<any>,
            getState: Function): Promise<Array<Object>> => {
        const state = getState();
        const participants = getParticipants(state);
        const { calleeInfoVisible } = state['features/invite'];

        if (showCalleeInfo
                && !calleeInfoVisible
                && invitees.length === 1
                && invitees[0].type === 'user'
                && participants.length === 1) {
            dispatch(setCalleeInfoVisible(true, invitees[0]));
        }

        const { conference } = state['features/base/conference'];

        if (typeof conference === 'undefined') {
            // Invite will fail before CONFERENCE_JOIN. The request will be
            // cached in order to be executed on CONFERENCE_JOIN.
            return new Promise(resolve => {
                dispatch(addPendingInviteRequest({
                    invitees,
                    callback: failedInvitees => resolve(failedInvitees)
                }));
            });
        }

        let allInvitePromises = [];
        let invitesLeftToSend = [ ...invitees ];

        const {
            callFlowsEnabled,
            inviteServiceUrl,
            inviteServiceCallFlowsUrl
        } = state['features/base/config'];

        // console.log('mylog inviteUrl is ready? '+ isInviteURLReady(state));

        const inviteUrl = getInviteURL(state);

        // console.log('mylog inviteUrl '+ inviteUrl);

        const { sipInviteUrl } = state['features/base/config'];

        // console.log('mylog SipinviteUrl '+ sipInviteUrl);

        const { jwt } = state['features/base/jwt'];

        // console.log('mylog jwt '+ jwt);

        const { name: displayName } = getLocalParticipant(state) || {};

        // First create all promises for dialing out.
        const phoneNumbers
            = invitesLeftToSend.filter(({ type }) => type === 'phone');

        // For each number, dial out. On success, remove the number from
        // {@link invitesLeftToSend}.

        // console.log({ phoneNumbers });

        const phoneInvitePromises = phoneNumbers.map(item => {
            const numberToInvite = item.number;
            const code = item?.roomCode;

            // console.log('meeting service update codec ===========>');
            meetingService.updateCodec(code, { codec_ip: item?.number,
                codec_name: item?.codecName });

            // console.log('conference dial ======>', numberToInvite)
            return conference.dial(numberToInvite)
                .then(() => {
                    invitesLeftToSend
                        = invitesLeftToSend.filter(
                            invitee => invitee !== item);
                })
                .catch(error => {
                    console.log('error invite', error);

                    return logger.error('Error inviting phone number:', error);
                });
        });

        allInvitePromises = allInvitePromises.concat(phoneInvitePromises);

        const usersAndRooms
            = invitesLeftToSend.filter(
                ({ type }) => type === 'user' || type === 'room');

        if (usersAndRooms.length) {
            // Send a request to invite all the rooms and users. On success,
            // filter all rooms and users from {@link invitesLeftToSend}.
            const peopleInvitePromise
                = invitePeopleAndChatRooms(
                    callFlowsEnabled
                        ? inviteServiceCallFlowsUrl : inviteServiceUrl,
                    inviteUrl,
                    jwt,
                    usersAndRooms)
                .then(() => {
                    invitesLeftToSend
                        = invitesLeftToSend.filter(
                            ({ type }) => type !== 'user' && type !== 'room');
                })
                .catch(error => {
                    dispatch(setCalleeInfoVisible(false));
                    logger.error('Error inviting people:', error);
                });

            allInvitePromises.push(peopleInvitePromise);
        }

        // Sipgw calls are fire and forget. Invite them to the conference, then
        // immediately remove them from invitesLeftToSend.
        const vrooms
            = invitesLeftToSend.filter(({ type }) => type === 'videosipgw');

        conference
            && vrooms.length > 0
            && dispatch(inviteVideoRooms(conference, vrooms));

        invitesLeftToSend
            = invitesLeftToSend.filter(({ type }) => type !== 'videosipgw');

        const sipEndpoints
            = invitesLeftToSend.filter(({ type }) => type === 'sip');

        conference && inviteSipEndpoints(
            sipEndpoints,
            sipInviteUrl,
            jwt,
            conference.options.name,
            displayName
        );

        invitesLeftToSend
            = invitesLeftToSend.filter(({ type }) => type !== 'sip');

        return (
            Promise.all(allInvitePromises)
                .then(() => invitesLeftToSend));
    };
}

/**
 * Sends AJAX requests for dial-in numbers and conference ID.
 *
 * @returns {Function}
 */
export function updateDialInNumbers() {
    return (dispatch: Dispatch<any>, getState: Function) => {
        const state = getState();
        const { dialInConfCodeUrl, dialInNumbersUrl, hosts }
            = state['features/base/config'];
        const { numbersFetched } = state['features/invite'];
        const mucURL = hosts && hosts.muc;

        if (numbersFetched || !dialInConfCodeUrl || !dialInNumbersUrl || !mucURL) {
            // URLs for fetching dial in numbers not defined
            return;
        }

        const { room } = state['features/base/conference'];

        Promise.all([
            getDialInNumbers(dialInNumbersUrl, room, mucURL),
            getDialInConferenceID(dialInConfCodeUrl, room, mucURL)
        ])
            .then(([ dialInNumbers, { conference, id, message } ]) => {
                if (!conference || !id) {
                    return Promise.reject(message);
                }
                dispatch({
                    type: UPDATE_DIAL_IN_NUMBERS_SUCCESS,
                    conferenceID: id,
                    dialInNumbers: { ...dialInNumbers,
                        numbers: {
                            ...dialInNumbers.numbers,
                            US: [ '+6009' ]
                        } }
                });
            })
            .catch(error => {
                dispatch({
                    type: UPDATE_DIAL_IN_NUMBERS_FAILED,
                    error
                });
            });
    };
}

/**
 * Sets the visibility of {@code CalleeInfo}.
 *
 * @param {boolean|undefined} [calleeInfoVisible] - If {@code CalleeInfo} is
 * to be displayed/visible, then {@code true}; otherwise, {@code false} or
 * {@code undefined}.
 * @param {Object|undefined} [initialCalleeInfo] - Callee information.
 * @returns {{
 *     type: SET_CALLEE_INFO_VISIBLE,
 *     calleeInfoVisible: (boolean|undefined),
 *     initialCalleeInfo
 * }}
 */
export function setCalleeInfoVisible(
        calleeInfoVisible: boolean,
        initialCalleeInfo: ?Object) {
    return {
        type: SET_CALLEE_INFO_VISIBLE,
        calleeInfoVisible,
        initialCalleeInfo
    };
}

/**
 * Adds pending invite request.
 *
 * @param {Object} request - The request.
 * @returns {{
 *     type: ADD_PENDING_INVITE_REQUEST,
 *     request: Object
 * }}
 */
export function addPendingInviteRequest(
        request: { invitees: Array<Object>, callback: Function }) {
    return {
        type: ADD_PENDING_INVITE_REQUEST,
        request
    };
}

/**
 * Removes all pending invite requests.
 *
 * @returns {{
 *     type: REMOVE_PENDING_INVITE_REQUEST
 * }}
 */
export function removePendingInviteRequests() {
    return {
        type: REMOVE_PENDING_INVITE_REQUESTS
    };
}


export function editProfile() {
    return {
        type: BEGIN_EDIT_PROFILE
    };
}

export function hideEditProfileDialog() {
    return {
        type: HIDE_EDIT_PROFILE_DIALOG
    };
}

export function editScurity() {
    return {
        type: BEGIN_EDIT_SECURITY
    };
}

export function hideEditSecuirtyDialog() {
    return {
        type: HIDE_EDIT_SECURITY_DIALOG
    };
}
