// @flow

import { hideDialog, openDialog } from '../base/dialog';
import { MiddlewareRegistry } from '../base/redux';

import {
    BEGIN_ADD_PEOPLE,
    HIDE_ADD_PEOPLE_DIALOG,
    BEGIN_EDIT_PROFILE,
    HIDE_EDIT_PROFILE_DIALOG,
    BEGIN_EDIT_SECURITY,
    HIDE_EDIT_SECURITY_DIALOG
} from './actionTypes';
import { AddPeopleDialog, ProfileDialog, SecurityDialog, AlertDialog} from './components';
import './middleware.any';

/**
 * The middleware of the feature invite specific to Web/React.
 *
 * @param {Store} store - The redux store.
 * @returns {Function}
 */
MiddlewareRegistry.register(store => next => action => {
    switch (action.type) {
    case BEGIN_ADD_PEOPLE:
        return _beginAddPeople(store, next, action);
    case HIDE_ADD_PEOPLE_DIALOG:
        return _hideAddPeopleDialog(store, next, action);
    case BEGIN_EDIT_PROFILE:
        return _beginEditProfile(store, next, action);
    case HIDE_EDIT_PROFILE_DIALOG:
        return _hideEditProfileDialog(store, next, action);
    case BEGIN_EDIT_SECURITY:
        return _beginEditSecurity(store, next, action);
    case HIDE_EDIT_SECURITY_DIALOG:
        return _hideEditSecurityDialog(store, next, action);
    }

    return next(action);
});

/**
 * Notifies the feature invite that the action {@link BEGIN_ADD_PEOPLE} is being
 * dispatched within a specific redux {@code store}.
 *
 * @param {Store} store - The redux store in which the specified {@code action}
 * is being dispatched.
 * @param {Dispatch} next - The redux {@code dispatch} function to dispatch the
 * specified {@code action} to the specified {@code store}.
 * @param {Action} action - The redux action {@code BEGIN_ADD_PEOPLE} which is
 * being dispatched in the specified {@code store}.
 * @private
 * @returns {*} The value returned by {@code next(action)}.
 */
function _beginAddPeople({ dispatch }, next, action) {
    const result = next(action);
    dispatch(openDialog(AddPeopleDialog, action));

    return result;
}


/**
 * Notifies the feature invite that the action {@link HIDE_ADD_PEOPLE_DIALOG} is being
 * dispatched within a specific redux {@code store}.
 *
 * @param {Store} store - The redux store in which the specified {@code action}
 * is being dispatched.
 * @param {Dispatch} next - The redux {@code dispatch} function to dispatch the
 * specified {@code action} to the specified {@code store}.
 * @param {Action} action - The redux action {@code HIDE_ADD_PEOPLE_DIALOG} which is
 * being dispatched in the specified {@code store}.
 * @private
 * @returns {*} The value returned by {@code next(action)}.
 */
function _hideAddPeopleDialog({ dispatch }, next, action) {
    dispatch(hideDialog(AddPeopleDialog));

    return next(action);
}

function _beginEditProfile({dispatch}, next, action) {
    const result = next(action);
    dispatch(openDialog(ProfileDialog, action));

    return result;
}

function _hideEditProfileDialog({dispatch}, next, action) {
    dispatch(hideDialog(ProfileDialog));
    dispatch(openDialog(AlertDialog));
    return next(action);
}

function _beginEditSecurity({dispatch}, next, action) {
    const result = next(action);
    dispatch(openDialog(SecurityDialog, action));

    return result;
}

function _hideEditSecurityDialog({dispatch}, next, action) {
    dispatch(hideDialog(SecurityDialog));
    dispatch(openDialog(AlertDialog))
    return next(action);
}