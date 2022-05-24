/* eslint-disable react/jsx-sort-props,react/jsx-no-bind */
import React, { useCallback, useState } from "react";

import { authService } from "../../../../service";
import { getRoomName } from "../../base/conference";
import { translate } from "../../base/i18n";
import { openSubscriptionModal as openSubscriptionAction, openForgotPassModal as openForgotPassModalAction } from "../actions";
import { IconAccountLogin, IconLogoComrex } from "../../base/icons";
import { ActionButton, InputField } from "../../base/premeeting";
import Footer from "../../base/premeeting/components/web/Footer";
import Preview from "../../base/premeeting/components/web/Preview";
import { connect } from "../../base/redux";
import { getDisplayName, updateSettings } from "../../base/settings";

const WelcomeScreen = (props) => {
    const { t, updateSettings, editProfile, openSubscriptionModal, openForgotPassModal } = props;
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [formType, setFormType] = useState('login');
    const [errorMessage, setErrorMessage] = useState("");
    const [error, setError] = useState({
        username: "",
        password: "",
        email: ""
    });

    const { DISPLAY_WELCOME_FOOTER } = interfaceConfig;

    const getContentClassName = () => {
        const showAdditionalContent =
            interfaceConfig.DISPLAY_WELCOME_PAGE_CONTENT &&
            this._additionalContentTemplate &&
            this._additionalContentTemplate.content &&
            this._additionalContentTemplate.innerHTML.trim();

        return showAdditionalContent ? "with-content" : "without-content";
    };

    const contentClassName = getContentClassName();
    const footerClassName = DISPLAY_WELCOME_FOOTER
        ? "with-footer"
        : "without-footer";

    const doForgotPass = useCallback(() => {
        setFormType('forgot')
    }, []);

    const submitEmail = useCallback(() => {
        const emailRegx = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if(email === '') {
            setError({
                ...error,
                email: "* Email is required"
            });
        } else if(!emailRegx.test(email)) {
            setError({
                ...error,
                email: "* Check the format of the email you entered"
            });
        } else if(email.length > 80) {
            setError({
                ...error,
                email: "* Maximum length is 80 characters"
            });
        } else {
            setError({
                ...error,
                email: ""
            });
            authService.requestResetPass(email)
            .then(resp => {
                    if(resp.data.success) {
                        openForgotPassModal();
                    }
                })
                .catch(err => {
                    setErrorMessage(err?.response?.data?.message);
                })
        }
    }, [email]);

    const _onFormSubmit = () => {
        setError({
            ...error,
            username: username.trim() ? "" : t("login.username_require"),
            password: password.trim() ? "" : t("login.password_require"),
        });

        if (username.trim() && password.trim()) {
            authService
                .login({ username, password })
                .then(({ data }) => {
                    console.log("response",data)
                    localStorage.setItem('auth_token', data.accessToken);
                    localStorage.setItem('refreshToken', data.refreshToken);
                    updateSettings({
                        user: {...data.user,
                            codec_ip: data.codec_ip,
                            codec_name: data.codec_name
                        }
                    });
                })
                .catch((error) => {
                    if(error.response.data.message === 'INVALID_SUBSCRIPTION') {
                        openSubscriptionModal();
                    } else {
                        setErrorMessage('The username or password is incorrect. Please reset your password or contact your administrator.');
                    }
                });
        }
    };

    return (
        <div
            className={`welcome ${contentClassName} ${footerClassName}`}
            id="welcome_page"
        >
            {/* <div className = 'welcome-watermark'>*/}
            {/* <Watermarks defaultJitsiLogoURL = { DEFAULT_WELCOME_PAGE_LOGO_URL } />*/}
            {/* </div>*/}
            <Preview />

            <div className="content welcome-screen welcome-screen-overlay">
                <div className="content-body content-body-500 content-body-welcome-screen height-100">
                    <div style={{ width: "100%" }}>
                        <div className="flex-row jus-between login-form-500" style={{alignItems: 'center'}}>
                            <div>
                                <a href='https://www.comrex.com/' target={'_blank'}>
                                    <IconLogoComrex
                                        className={"comrex-icon-500"}
                                        height="40px"
                                    />
                                </a>
                            </div>
                            <div>
                                <img
                                    className={"gagl-logo"}
                                    src="./images/gagl.png"
                                />
                            </div>
                        </div>
                        <div
                            className="prejoin-input-area-container login-form-500"
                            style={{
                                backgroundColor: "white",
                                marginTop: 25,
                                borderRadius: 16,
                                boxShadow: "1px 1px 2px 1px rgb(0 0 0 / 25%)",
                            }}
                        >
                            <div
                                className={"login-form-header-100"}
                                style={{
                                    height: 140,
                                    width: "100%",
                                    backgroundColor: "#9eb7ca",
                                    position: "relative",
                                    borderTopLeftRadius: 10,
                                    borderTopRightRadius: 10,
                                }}
                            >
                                <div
                                    style={{
                                        position: "absolute",
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <img
                                        width="92%"
                                        height="100%"
                                        src="./images/account-background.png"
                                    />
                                </div>
                                <div
                                    style={{
                                        position: "absolute",
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <IconAccountLogin height="100%" />
                                </div>
                            </div>
                            <div className="prejoin-input-area welcome-input-side padding-350">
                                {formType === 'login' && (
                                    <>
                                        <div style={{ width: "100%", height: 45 }}>
                                        <InputField
                                            autoFocus={true}
                                            onChange={(value) => {
                                                setUsername(value);
                                                setError({
                                                    ...error,
                                                    username: "",
                                                });
                                            }}
                                            value={username}
                                            placeHolder={t("login.username")}
                                        />
                                        <p
                                            style={{
                                                color: "red",
                                                display: "flex",
                                            }}
                                        >
                                            {error.username}
                                        </p>
                                    </div>
                                    <div style={{ marginTop: 30, width: "100%" }}>
                                        <InputField
                                            // className={showError ? "error" : ""}
                                            // hasError={showError}
                                            type={"password"}
                                            onChange={(value) => {
                                                setPassword(value);
                                                setError({
                                                    ...error,
                                                    password: "",
                                                });
                                            }}
                                            value={password}
                                            placeHolder={t("login.password")}
                                        />
                                        <p
                                            style={{
                                                color: "red",
                                                display: "flex",
                                            }}
                                        >
                                            {error.password}
                                        </p>
                                    </div>
                                    <div style={{ marginTop: 30 }}>
                                        <ActionButton
                                            className="button-login"
                                            onClick={_onFormSubmit}
                                            testId="prejoin.joinMeeting"
                                            type="primary"
                                        >
                                            {t("login.signIn")}
                                        </ActionButton>
                                        <p
                                            style={{
                                                color: "red",
                                                marginTop: 10,
                                                display: "flex",
                                            }}
                                        >
                                            {errorMessage ? t(errorMessage) : ""}
                                        </p>
                                    </div>
                                </>
                                )}
                                {formType === 'forgot' && (
                                    <>
                                        <div style={{ width: "100%", height: 45 }}>
                                            <InputField
                                                autoFocus={true}
                                                onChange={(value) => {
                                                    setEmail(value);
                                                    setError({
                                                        ...error,
                                                        email: "",
                                                    });
                                                }}
                                                value={email}
                                                placeHolder={t("login.email")}
                                            />
                                            <p
                                                style={{
                                                    color: "red",
                                                    display: "flex",
                                                }}
                                            >
                                                {error.email}
                                            </p>
                                        </div>
                                        <div style={{ marginTop: 30 }}>
                                        <ActionButton
                                            className="button-login"
                                            onClick={() => submitEmail()}
                                            type="primary"
                                        >
                                            {t("login.submit")}
                                        </ActionButton>
                                        <p
                                            style={{
                                                color: "red",
                                                marginTop: 10,
                                                display: "flex",
                                            }}
                                        >
                                            {errorMessage ? t(errorMessage) : ""}
                                        </p>
                                    </div>
                                    </>
                                )}

                            </div>
                        </div>
                        <div
                            className={
                                "welcome-input-footer welcome-screen-input-footer"
                            }
                        >
                            {formType === 'login' ?
                                <div
                                    style={{
                                        fontSize: 16,
                                        color: "#777777",
                                        textAlign: "center",
                                        fontFamily: "fangsong",
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => doForgotPass()}
                                >
                                    {t("login.forgotYourPassword")}
                                </div>
                                :
                                <div
                                    style={{
                                        fontSize: 16,
                                        color: "#777777",
                                        textAlign: "center",
                                        fontFamily: "fangsong",
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setFormType('login')}
                                >
                                    {t("login.signIn")}
                                </div>
                            }
                        </div>
                    </div>
                </div>
                <div className={"footer-welcome-screen z-index-1"}>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

function mapStateToProps(state, ownProps) {
    const name = getDisplayName(state);

    return {
        name,
        roomName: getRoomName(state),
    };
}

const mapDispatchToProps = {
    updateSettings,
    openSubscriptionModal: openSubscriptionAction,
    openForgotPassModal: openForgotPassModalAction
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(translate(WelcomeScreen));
