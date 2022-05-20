import { hideDialog, openDialog } from '../base/dialog';
import { MiddlewareRegistry } from '../base/redux';

import {
    SET_SIDEBAR_VISIBLE,
    SET_WELCOME_PAGE_LISTS_DEFAULT_PAGE,
    OPEN_SUBSCRIPTION_MODAL,
    CLOSE_SUBSCRIPTION_MODAL,
    OPEN_FORGOT_PASS_MODAL,
    CLOSE_FORGOT_PASS_MODAL
} from './actionTypes';
import  ForgotPassDialog  from './components/forgot-dialog/web/ForgotPassDialog';
import SubscriptionDialog from './components/subscribe-dialog/web/SubscriptionDialog';


MiddlewareRegistry.register(store => next => action => {
    switch (action.type) {
    case OPEN_SUBSCRIPTION_MODAL:
        return _openSubscriptionModal(store, next, action);
    case CLOSE_SUBSCRIPTION_MODAL:
        return _closeSubscriptionModal(store, next, action);
    case OPEN_FORGOT_PASS_MODAL:
        return _openForgotPassModal(store, next, action);
    case CLOSE_FORGOT_PASS_MODAL:
        return _closeForgotPassModal(store, next, action);
    }
    
    return next(action);
});

function _openSubscriptionModal({ dispatch }, next, action) {
    const result = next(action);
    dispatch(openDialog(SubscriptionDialog, action));

    return result;
}

function _closeSubscriptionModal({ dispatch }, next, action) {
    dispatch(hideDialog(SubscriptionDialog));
    return next(action);
}

function _openForgotPassModal({dispatch}, next, action) {
    const result = next(action);
    dispatch(openDialog(ForgotPassDialog, action));

    return result;
}

function _closeForgotPassModal({dispatch}, next, action) {
    dispatch(hideDialog(ForgotPassDialog));

    return next(action);
}


