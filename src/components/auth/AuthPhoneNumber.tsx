import { ChangeEvent } from 'react';
import { axiosService } from '../../api/services/axiosService';
import { HEYMATE_URL } from '../../config';
// @ts-ignore
import monkeyPath from '../../assets/monkey.svg';

import React, {
  FC, memo, useCallback, useEffect, useLayoutEffect, useRef, useState,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions, GlobalState } from '../../global/types';
import { LangCode } from '../../types';
import { ApiCountryCode } from '../../api/types';

import { IS_SAFARI, IS_TOUCH_ENV } from '../../util/environment';
import { preloadImage } from '../../util/files';
import preloadFonts from '../../util/fonts';
import { pick } from '../../util/iteratees';
import { formatPhoneNumber, getCountryCodesByIso, getCountryFromPhoneNumber } from '../../util/phoneNumber';
import { setLanguage } from '../../util/langProvider';
import useLang from '../../hooks/useLang';
import useFlag from '../../hooks/useFlag';
import useLangString from '../../hooks/useLangString';
import { getSuggestedLanguage } from './helpers/getSuggestedLanguage';

import Button from '../ui/Button';
import Checkbox from '../ui/Checkbox';
import InputText from '../ui/InputText';
import Loading from '../ui/Loading';
import CountryCodeInput from './CountryCodeInput';
import AuthOnBoarding from './AuthOnBoarding';

import { IAuth } from '../../types/HeymateTypes/Auth.model';

type StateProps = Pick<GlobalState, (
  'connectionState' | 'authState' |
  'authPhoneNumber' | 'authIsLoading' |
  'authIsLoadingQrCode' | 'authError' |
  'authRememberMe' | 'authNearestCountry'
)> & {
  language?: LangCode;
  phoneCodeList: ApiCountryCode[];
};
type DispatchProps = Pick<GlobalActions, (
  'setAuthPhoneNumber' | 'setAuthRememberMe' | 'loadNearestCountry' | 'loadCountryList' | 'clearAuthError' |
  'goToAuthQrCode' | 'setSettingOption' | 'returnToAuthPhoneNumber' | 'setCurrentUserPhoneNumber'
)>;

const MIN_NUMBER_LENGTH = 7;

let isPreloadInitiated = false;

const AuthPhoneNumber: FC<StateProps & DispatchProps> = ({
  connectionState,
  authState,
  authPhoneNumber,
  authIsLoading,
  authIsLoadingQrCode,
  authError,
  authRememberMe,
  authNearestCountry,
  phoneCodeList,
  language,
  setAuthPhoneNumber,
  setAuthRememberMe,
  loadNearestCountry,
  loadCountryList,
  clearAuthError,
  goToAuthQrCode,
  setSettingOption,
  returnToAuthPhoneNumber,
  setCurrentUserPhoneNumber,
}) => {
  const lang = useLang();
  // eslint-disable-next-line no-null/no-null
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestedLanguage = getSuggestedLanguage();

  const continueText = useLangString(suggestedLanguage, 'ContinueOnThisLanguage');
  const [country, setCountry] = useState<ApiCountryCode | undefined>();
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>();
  const [isTouched, setIsTouched] = useState(false);
  const [lastSelection, setLastSelection] = useState<[number, number] | undefined>();
  const [isLoading, markIsLoading, unmarkIsLoading] = useFlag();

  const fullNumber = country ? `+${country.countryCode} ${phoneNumber || ''}` : phoneNumber;
  const canSubmit = fullNumber && fullNumber.replace(/[^\d]+/g, '').length >= MIN_NUMBER_LENGTH;

  useEffect(() => {
    if (!IS_TOUCH_ENV) {
      inputRef.current!.focus();
    }
  }, [country]);

  useEffect(() => {
    if (connectionState === 'connectionStateReady' && !authNearestCountry) {
      loadNearestCountry();
    }
  }, [connectionState, authNearestCountry, loadNearestCountry]);

  useEffect(() => {
    if (connectionState === 'connectionStateReady') {
      loadCountryList({ langCode: language });
    }
  }, [connectionState, language, loadCountryList]);

  useEffect(() => {
    if (authNearestCountry && phoneCodeList && !country && !isTouched) {
      setCountry(getCountryCodesByIso(phoneCodeList, authNearestCountry)[0]);
    }
  }, [country, authNearestCountry, isTouched, phoneCodeList]);

  const parseFullNumber = useCallback((newFullNumber: string) => {
    if (!newFullNumber.length) {
      setPhoneNumber('');
    }

    const suggestedCountry = phoneCodeList && getCountryFromPhoneNumber(phoneCodeList, newFullNumber);

    // Any phone numbers should be allowed, in some cases ignoring formatting
    const selectedCountry = !country
    || (suggestedCountry && suggestedCountry.iso2 !== country.iso2)
    || (!suggestedCountry && newFullNumber.length)
      ? suggestedCountry
      : country;

    if (!country || !selectedCountry || (selectedCountry && selectedCountry.iso2 !== country.iso2)) {
      setCountry(selectedCountry);
    }
    setPhoneNumber(formatPhoneNumber(newFullNumber, selectedCountry));
  }, [phoneCodeList, country]);

  const handleLangChange = useCallback(() => {
    markIsLoading();

    void setLanguage(suggestedLanguage, () => {
      unmarkIsLoading();

      setSettingOption({ language: suggestedLanguage });
    });
  }, [markIsLoading, setSettingOption, suggestedLanguage, unmarkIsLoading]);

  useEffect(() => {
    if (phoneNumber === undefined && authPhoneNumber) {
      parseFullNumber(authPhoneNumber);
    }
  }, [authPhoneNumber, phoneNumber, parseFullNumber]);

  useLayoutEffect(() => {
    if (inputRef.current && lastSelection) {
      inputRef.current.setSelectionRange(...lastSelection);
    }
  }, [lastSelection]);

  const isJustPastedRef = useRef(false);
  const handlePaste = useCallback(() => {
    isJustPastedRef.current = true;
    requestAnimationFrame(() => {
      isJustPastedRef.current = false;
    });
  }, []);

  const handleCountryChange = useCallback((value: ApiCountryCode) => {
    setCountry(value);
    setPhoneNumber('');
  }, []);

  const handlePhoneNumberChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (authError) {
      clearAuthError();
    }

    // This is for further screens. We delay it until user input to speed up the initial loading.
    if (!isPreloadInitiated) {
      isPreloadInitiated = true;
      preloadFonts();
      void preloadImage(monkeyPath);
    }

    const { value, selectionStart, selectionEnd } = e.target;
    setLastSelection(
      selectionStart && selectionEnd && selectionEnd < value.length
        ? [selectionStart, selectionEnd]
        : undefined,
    );

    setIsTouched(true);

    const shouldFixSafariAutoComplete = (
      IS_SAFARI && country && fullNumber !== undefined
      && value.length - fullNumber.length > 1 && !isJustPastedRef.current
    );
    parseFullNumber(shouldFixSafariAutoComplete ? `${country!.countryCode} ${value}` : value);
  }, [authError, clearAuthError, country, fullNumber, parseFullNumber]);

  const handleKeepSessionChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setAuthRememberMe(e.target.checked);
  }, [setAuthRememberMe]);

  /**
   * Create User In To Heymate Back With Phone Number, Password, DeviceId, PushId
   * @param phone_number
   */
  const handleHeymateCreateUser = async (phone_number: any) => {
    const response: IAuth = await axiosService({
      url: `${HEYMATE_URL}/users/putPushToken`,
      method: 'POST',
      body: {
        phoneNumber: phone_number,
        deviceId: '781', // Required as still persist in AWS DynamoDB User table Query
      },
    });
    if (response.status === 201) {
      console.log(response);
    }
  };

  /**
   * Sign In To Heymate Back With Phone Number
   * @param phone_number
   */
  const handleHeymateLogin = async (phone_number: any) => {
    const response: IAuth = await axiosService({
      url: `${HEYMATE_URL}/auth/login`,
      method: 'POST',
      body: {
        phone_number,
        password: '123456',
      },
    });
    if (response.status === 201) {
      const token = response.data.idToken.jwtToken;
      const userId = response.data.idToken.payload.sub;
      const refreshToken = response.data.refreshToken.token;
      localStorage.setItem('HM_TOKEN', token);
      localStorage.setItem('HM_REFRESH_TOKEN', refreshToken);
      localStorage.setItem('HM_PHONE', phone_number);
      localStorage.setItem('HM_USERID', userId);
    }
  };

  /**
   *Handle To Sign Up the User
   */
  const handleHeymateRegister = async (phone_number: any) => {
    const userPhone = phone_number.replace(/ /g, '');
    const response: IAuth = await axiosService({
      url: `${HEYMATE_URL}/auth/register`,
      method: 'POST',
      body: {
        phone_number: userPhone,
        password: '123456',
      },
    });
    if(response.data['message'] == 'An account with the given phone_number already exists.') {
      handleHeymateLogin(userPhone);
      // handleHeymateCreateUser function will be called only one time once for the new user if we use the conditional approach in the webapp
      handleHeymateCreateUser(userPhone); // Todo: Later stage we will evolve the create user endpoint to check if the user already exists or not in user table.
    } else {
      handleHeymateLogin(userPhone);
      handleHeymateCreateUser(userPhone);
    }
  };

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (authIsLoading) {
      return;
    }

    if (canSubmit) {
      handleHeymateRegister(fullNumber);
      setCurrentUserPhoneNumber({ currentUserPhoneNumber: fullNumber });
      setAuthPhoneNumber({ phoneNumber: fullNumber });
    }
  }

  const isAuthReady = authState === 'authorizationStateWaitPhoneNumber' || 'authorizationStateWaitQrCode';
  if (authState === 'authorizationStateWaitQrCode') {
    returnToAuthPhoneNumber();
  }
  return (
    <div id="auth-phone-number-form" className="custom-scroll">
      <AuthOnBoarding />
      <div className="auth-form">
        <div id="logo" />
        <h2>Telegram</h2>
        <p className="note">{lang('StartText')}</p>
        <form action="" onSubmit={handleSubmit}>
          <CountryCodeInput
            id="sign-in-phone-code"
            value={country}
            isLoading={!authNearestCountry && !country}
            onChange={handleCountryChange}
          />
          <InputText
            ref={inputRef}
            id="sign-in-phone-number"
            label={lang('Login.PhonePlaceholder')}
            value={fullNumber}
            error={authError && lang(authError)}
            inputMode="tel"
            onChange={handlePhoneNumberChange}
            onPaste={IS_SAFARI ? handlePaste : undefined}
          />
          <Checkbox
            id="sign-in-keep-session"
            label="Keep me signed in"
            checked={Boolean(authRememberMe)}
            onChange={handleKeepSessionChange}
          />
          {canSubmit && (
            isAuthReady ? (
              <Button type="submit" ripple isLoading={authIsLoading}>{lang('Login.Next')}</Button>
            ) : (
              <Loading />
            )
          )}
          {/* {isAuthReady && (
            <Button isText ripple isLoading={authIsLoadingQrCode} onClick={goToAuthQrCode}>
              {lang('Login.QR.Login')}
            </Button>
          )} */}
          {suggestedLanguage && suggestedLanguage !== language && continueText && (
            <Button isText isLoading={isLoading} onClick={handleLangChange}>{continueText}</Button>
          )}
        </form>
      </div>
    </div>
  );
};

export default memo(withGlobal(
  (global): StateProps => {
    const {
      settings: { byKey: { language } },
      countryList: { phoneCodes: phoneCodeList },
    } = global;

    return {
      ...pick(global, [
        'connectionState',
        'authState',
        'authPhoneNumber',
        'authIsLoading',
        'authIsLoadingQrCode',
        'authError',
        'authRememberMe',
        'authNearestCountry',
      ]),
      language,
      phoneCodeList,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, [
    'setAuthPhoneNumber',
    'setAuthRememberMe',
    'clearAuthError',
    'loadNearestCountry',
    'loadCountryList',
    'goToAuthQrCode',
    'setSettingOption',
    'returnToAuthPhoneNumber',
    'setCurrentUserPhoneNumber',
  ]),
)(AuthPhoneNumber));
