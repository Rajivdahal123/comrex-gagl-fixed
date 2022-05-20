// @flow

import {
    SET_SIDEBAR_VISIBLE,
    SET_WELCOME_PAGE_LISTS_DEFAULT_PAGE,
    OPEN_SUBSCRIPTION_MODAL,
    CLOSE_SUBSCRIPTION_MODAL,
    OPEN_FORGOT_PASS_MODAL,
    CLOSE_FORGOT_PASS_MODAL
} from './actionTypes';

/**
 * Sets the visibility of {@link WelcomePageSideBar}.
 *
 * @param {boolean} visible - If the {@code WelcomePageSideBar} is to be made
 * visible, {@code true}; otherwise, {@code false}.
 * @returns {{
 *     type: SET_SIDEBAR_VISIBLE,
 *     visible: boolean
 * }}
 */
export function setSideBarVisible(visible: boolean) {
    return {
        type: SET_SIDEBAR_VISIBLE,
        visible
    };
}

/**
 * Sets the default page index of {@link WelcomePageLists}.
 *
 * @param {number} pageIndex - The index of the default page.
 * @returns {{
 *     type: SET_WELCOME_PAGE_LISTS_DEFAULT_PAGE,
 *     pageIndex: number
 * }}
 */
export function setWelcomePageListsDefaultPage(pageIndex: number) {
    return {
        type: SET_WELCOME_PAGE_LISTS_DEFAULT_PAGE,
        pageIndex
    };
}

export function openSubscriptionModal() {
    return {
        type: OPEN_SUBSCRIPTION_MODAL
    }
}

export function closeSubscriptionModal() {
    return {
        type: CLOSE_SUBSCRIPTION_MODAL
    }
}

export function openForgotPassModal() {
    return {
        type: OPEN_FORGOT_PASS_MODAL
    }
}

export function closeForgotPassModal() {
    return {
        type: CLOSE_FORGOT_PASS_MODAL
    }
}