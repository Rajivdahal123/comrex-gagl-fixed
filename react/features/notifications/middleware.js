/* @flow */

import { jitsiLocalStorage } from '@jitsi/js-utils/jitsi-local-storage';

import { getCurrentConference } from '../base/conference';
import {
    PARTICIPANT_JOINED,
    PARTICIPANT_LEFT,
    PARTICIPANT_ROLE,
    PARTICIPANT_UPDATED,
    getParticipantById,
    getParticipantDisplayName, kickParticipant
} from '../base/participants';
import { MiddlewareRegistry, StateListenerRegistry } from '../base/redux';

import {
    clearNotifications,
    showNotification,
    showParticipantJoinedNotification
} from './actions';
import { NOTIFICATION_TIMEOUT } from './constants';
import { joinLeaveNotificationsDisabled } from './functions';
declare var interfaceConfig: Object;

/**
 * Middleware that captures actions to display notifications.
 *
 * @param {Store} store - The redux store.
 * @returns {Function}
 */
MiddlewareRegistry.register(store => next => action => {
    const user = jitsiLocalStorage.getItem('features/base/settings') ? JSON.parse(jitsiLocalStorage.getItem('features/base/settings'))?.user : {};

    switch (action.type) {
    case PARTICIPANT_JOINED: {
        const result = next(action);
        const { participant: p } = action;
        const { dispatch, getState } = store;

        const members = getState()['features/base/settings']?.meeting?.members;
        const codec = getState()['features/base/settings']?.codec;

        const member = members?.find(item => item.email === p?.email);

        let role = 'none';

        if (member) {
            role = member.role;
        }

        if (!p.local && !joinLeaveNotificationsDisabled()) {
            dispatch(showParticipantJoinedNotification(
                getParticipantDisplayName(getState, p.id)
            ));
        }

        if (typeof interfaceConfig === 'object'
                && !interfaceConfig.DISABLE_FOCUS_INDICATOR && role === PARTICIPANT_ROLE.MODERATOR) {
            // Do not show the notification for mobile and also when the focus indicator is disabled.
            const displayName = getParticipantDisplayName(getState, p.id);

            dispatch(showNotification({
                descriptionArguments: { to: displayName || '$t(notify.somebody)' },
                descriptionKey: 'notify.grantedTo',
                titleKey: 'notify.somebody',
                title: displayName === codec?.codec_ip ? codec?.codec_name : displayName
            },
            NOTIFICATION_TIMEOUT));
        }

        action.participant.role = role;

        return result;
    }
    case PARTICIPANT_LEFT: {
        const { getState } = store;
        const codec = getState()['features/base/settings']?.codec;


        if (!joinLeaveNotificationsDisabled()) {
            const participant = getParticipantById(
                store.getState(),
                action.participant.id
            );

            if (typeof interfaceConfig === 'object'
                && participant
                && !participant.local) {
                store.dispatch(showNotification({
                    descriptionKey: 'notify.disconnected',
                    titleKey: 'notify.somebody',
                    title: participant.name === codec?.codec_ip ? codec?.codec_name : participant.name
                }, NOTIFICATION_TIMEOUT));
            }
        }

        return next(action);
    }
    case PARTICIPANT_UPDATED: {
        if (typeof interfaceConfig === 'undefined' || interfaceConfig.DISABLE_FOCUS_INDICATOR) {
            // Do not show the notification for mobile and also when the focus indicator is disabled.
            return next(action);
        }

        const { id } = action.participant;
        const state = store.getState();
        const oldParticipant = getParticipantById(state, id);
        const oldRole = oldParticipant?.role;

        const members = store.getState()['features/base/settings']?.meeting?.members;

        const member = members?.find(item => item?.email === oldParticipant?.email);

        if (action.participant.role) {
            action.participant.role = member?.role || 'none';
        }

        const role = action.participant.role;

        if (oldRole && oldRole !== role && role === PARTICIPANT_ROLE.MODERATOR) {
            const displayName = getParticipantDisplayName(state, id);

            store.dispatch(showNotification({
                descriptionArguments: { to: displayName || '$t(notify.somebody)' },
                descriptionKey: 'notify.grantedTo',
                titleKey: 'notify.somebody',
                title: displayName
            },
            NOTIFICATION_TIMEOUT));
        }

        return next(action);
    }
    }

    return next(action);
});

/**
 * StateListenerRegistry provides a reliable way to detect the leaving of a
 * conference, where we need to clean up the notifications.
 */
StateListenerRegistry.register(
    /* selector */ state => getCurrentConference(state),
    /* listener */ (conference, { dispatch }) => {
        if (!conference) {
            dispatch(clearNotifications());
        }
    }
);
