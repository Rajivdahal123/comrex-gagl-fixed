// @flow

/**
 * The type of the (redux) action which sets the visibility of
 * {@link WelcomePageSideBar}.
 *
 * {
 *     type: SET_SIDEBAR_VISIBLE,
 *     visible: boolean
 * }
 */
export const SET_SIDEBAR_VISIBLE = 'SET_SIDEBAR_VISIBLE';

/**
 * The type of (redux) action to set the default page index of
 * {@link WelcomePageLists}.
 *
 * {
 *     type: SET_WELCOME_PAGE_LISTS_DEFAULT_PAGE,
 *     pageIndex: number
 * }
 */
export const SET_WELCOME_PAGE_LISTS_DEFAULT_PAGE
    = 'SET_WELCOME_PAGE_LIST_DEFAULT_PAGE';


export const OPEN_SUBSCRIPTION_MODAL = 'OPEN_SUBSCRIPTION_MODAL';

export const CLOSE_SUBSCRIPTION_MODAL = 'CLOSE_SUBSCRIPTION_MODAL';

export const OPEN_FORGOT_PASS_MODAL = 'OPEN_FORGOT_PASS_MODAL';

export const CLOSE_FORGOT_PASS_MODAL = 'CLOSE_FORGOT_PASS_MODAL'