import { getGlobal, withGlobal } from 'teact/teactn';
import React, {
  FC, useEffect, memo, useCallback,
} from '../../lib/teact/teact';

import { LangCode } from '../../types';
import { GlobalActions } from '../../global/types';
import { ApiMessage, ApiUser } from '../../api/types';

import '../../modules/actions/all';
import {
  BASE_EMOJI_KEYWORD_LANG,
  DEBUG, HEYMATE_URL,
  INACTIVE_MARKER,
  PAGE_TITLE,
} from '../../config';
import { pick } from '../../util/iteratees';
import {
  selectChatMessage,
  selectCountNotMutedUnread,
  selectIsForwardModalOpen,
  selectIsMediaViewerOpen,
  selectIsRightColumnShown,
  selectIsServiceChatReady,
  selectUser,
} from '../../modules/selectors';
import { dispatchHeavyAnimationEvent } from '../../hooks/useHeavyAnimationCheck';
import buildClassName from '../../util/buildClassName';
import { fastRaf } from '../../util/schedulers';
import { waitForTransitionEnd } from '../../util/cssAnimationEndListeners';
import useShowTransition from '../../hooks/useShowTransition';
import useBackgroundMode from '../../hooks/useBackgroundMode';
import useBeforeUnload from '../../hooks/useBeforeUnload';
import useOnChange from '../../hooks/useOnChange';
import usePreventPinchZoomGesture from '../../hooks/usePreventPinchZoomGesture';
import { processDeepLink } from '../../util/deeplink';
import { LOCATION_HASH } from '../../hooks/useHistoryBack';

import LeftColumn from '../left/LeftColumn';
import MiddleColumn from '../middle/MiddleColumn';
import RightColumn from '../right/RightColumn';
import MediaViewer from '../mediaViewer/MediaViewer.async';
import AudioPlayer from '../middle/AudioPlayer';
import DownloadManager from './DownloadManager';
import Notifications from './Notifications.async';
import ZoomDialog from './components/ZoomDialog.async';
import Dialogs from './Dialogs.async';
import ForwardPicker from './ForwardPicker.async';
import SafeLinkModal from './SafeLinkModal.async';
import HistoryCalendar from './HistoryCalendar.async';
import StickerSetModal from '../common/StickerSetModal.async';
import GroupCall from '../calls/group/GroupCall.async';
import ActiveCallHeader from '../calls/ActiveCallHeader.async';
import CallFallbackConfirm from '../calls/CallFallbackConfirm.async';

import './Main.scss';
import { IAuth } from '../../types/HeymateTypes/Auth.model';
import { axiosService } from '../../api/services/axiosService';

type StateProps = {
  lastSyncTime?: number;
  isLeftColumnShown: boolean;
  isRightColumnShown: boolean;
  isMediaViewerOpen: boolean;
  isForwardModalOpen: boolean;
  hasNotifications: boolean;
  openZoomDialog: boolean;
  hasDialogs: boolean;
  audioMessage?: ApiMessage;
  safeLinkModalUrl?: string;
  isHistoryCalendarOpen: boolean;
  shouldSkipHistoryAnimations?: boolean;
  openedStickerSetShortName?: string;
  activeGroupCallId?: string;
  isServiceChatReady?: boolean;
  animationLevel: number;
  language?: LangCode;
  wasTimeFormatSetManually?: boolean;
  isCallFallbackConfirmOpen: boolean;
  showHeymate?: boolean;
  showHeymateWalletMiddle?: boolean;
  currentUserId?: string;
  currentUserPhoneNumber?: string;
  currentUser?: ApiUser;
};

type DispatchProps = Pick<
GlobalActions,
| 'loadAnimatedEmojis'
| 'loadNotificationSettings'
| 'loadNotificationExceptions'
| 'updateIsOnline'
| 'loadTopInlineBots'
| 'loadEmojiKeywords'
| 'openStickerSetShortName'
|
'loadCountryList' | 'ensureTimeFormat' | 'checkVersionNotification'
>;

const NOTIFICATION_INTERVAL = 1000;

let notificationInterval: number | undefined;

// eslint-disable-next-line @typescript-eslint/naming-convention
let DEBUG_isLogged = false;

const Main: FC<StateProps & DispatchProps> = ({
  lastSyncTime,
  isLeftColumnShown,
  isRightColumnShown,
  isMediaViewerOpen,
  isForwardModalOpen,
  hasNotifications,
  openZoomDialog,
  hasDialogs,
  audioMessage,
  activeGroupCallId,
  safeLinkModalUrl,
  isHistoryCalendarOpen,
  shouldSkipHistoryAnimations,
  openedStickerSetShortName,
  isServiceChatReady,
  animationLevel,
  language,
  wasTimeFormatSetManually,
  isCallFallbackConfirmOpen,
  loadAnimatedEmojis,
  loadNotificationSettings,
  loadNotificationExceptions,
  updateIsOnline,
  loadTopInlineBots,
  loadEmojiKeywords,
  loadCountryList,
  ensureTimeFormat,
  openStickerSetShortName,
  checkVersionNotification,
  currentUserId,
  currentUserPhoneNumber,
  currentUser,
}) => {
  if (DEBUG && !DEBUG_isLogged) {
    DEBUG_isLogged = true;
    // eslint-disable-next-line no-console
    console.log('>>> RENDER MAIN');
  }

  // Initial API calls
  useEffect(() => {
    if (lastSyncTime) {
      updateIsOnline(true);
      loadAnimatedEmojis();
      loadNotificationSettings();
      loadNotificationExceptions();
      loadTopInlineBots();

      loadEmojiKeywords({ language: BASE_EMOJI_KEYWORD_LANG });
      if (language !== BASE_EMOJI_KEYWORD_LANG) {
        loadEmojiKeywords({ language });
      }

      loadCountryList({ langCode: language });
    }
  }, [
    lastSyncTime,
    loadAnimatedEmojis,
    loadNotificationExceptions,
    loadNotificationSettings,
    updateIsOnline,
    loadTopInlineBots,
    loadEmojiKeywords,
    loadCountryList,
    language,
  ]);

  useEffect(() => {
    if (lastSyncTime && isServiceChatReady) {
      checkVersionNotification();
    }
  }, [lastSyncTime, isServiceChatReady, checkVersionNotification]);

  useEffect(() => {
    if (lastSyncTime && !wasTimeFormatSetManually) {
      ensureTimeFormat();
    }
  }, [lastSyncTime, wasTimeFormatSetManually, ensureTimeFormat]);

  useEffect(() => {
    if (lastSyncTime && LOCATION_HASH.startsWith('#?tgaddr=')) {
      processDeepLink(
        decodeURIComponent(LOCATION_HASH.substr('#?tgaddr='.length)),
      );
    }
  }, [lastSyncTime]);

  const handleHeymateLogin = async (phone_number: any, userId?:string) => {
    if (typeof phone_number === 'undefined') {
      phone_number = localStorage.getItem('HM_PHONE');
    }
    const userPhone = phone_number.replace(/ /g, '');

    const response: IAuth = await axiosService({
      url: `${HEYMATE_URL}/auth/login`,
      method: 'POST',
      body: {
        phone_number: userPhone,
        password: '123456',
        telegram_id: userId,
      },
    });
    if (response.status === 201) {
      const token = response.data.accessToken.jwtToken;
      const refreshToken = response.data.refreshToken.token;
      localStorage.setItem('HM_TOKEN', token);
      localStorage.setItem('HM_REFRESH_TOKEN', refreshToken);
      localStorage.setItem('HM_PHONE', userPhone);
    }
  };

  const handleHeymateUpdateUser = async (currentUser) => {
    const response: IAuth = await axiosService({
      url: `${HEYMATE_URL}/users/updateUserInfo`,
      method: 'PATCH',
      body: {
        fullName: currentUser.firstName,
        userName: currentUser.username,
        avatarHash: currentUser.avatarHash,
        telegramId: currentUser.id,
      },
    });
    if (response && response.status === 200) {
      console.log(response);
    }
  };

  useEffect(() => {
    if (typeof currentUserId !== 'undefined') {
      handleHeymateUpdateUser(currentUser);
    }
  }, [currentUserId, currentUserPhoneNumber]);

  const { transitionClassNames: middleColumnTransitionClassNames } = useShowTransition(
    !isLeftColumnShown,
    undefined,
    true,
    undefined,
    shouldSkipHistoryAnimations,
  );

  const { transitionClassNames: rightColumnTransitionClassNames } = useShowTransition(
    isRightColumnShown,
    undefined,
    true,
    undefined,
    shouldSkipHistoryAnimations,
  );

  const className = buildClassName(
    middleColumnTransitionClassNames.replace(/([\w-]+)/g, 'middle-column-$1'),
    rightColumnTransitionClassNames.replace(/([\w-]+)/g, 'right-column-$1'),
    shouldSkipHistoryAnimations && 'history-animation-disabled',
  );

  // Dispatch heavy transition event when opening middle column
  useOnChange(
    ([prevIsLeftColumnShown]) => {
      if (prevIsLeftColumnShown === undefined || animationLevel === 0) {
        return;
      }

      const dispatchHeavyAnimationEnd = dispatchHeavyAnimationEvent();

      waitForTransitionEnd(
        document.getElementById('MiddleColumn')!,
        dispatchHeavyAnimationEnd,
      );
    },
    [isLeftColumnShown],
  );

  // Dispatch heavy transition event and add body class when opening right column
  useOnChange(
    ([prevIsRightColumnShown]) => {
      if (prevIsRightColumnShown === undefined || animationLevel === 0) {
        return;
      }

      fastRaf(() => {
        document.body.classList.add('animating-right-column');
      });

      const dispatchHeavyAnimationEnd = dispatchHeavyAnimationEvent();

      waitForTransitionEnd(document.getElementById('RightColumn')!, () => {
        dispatchHeavyAnimationEnd();

        fastRaf(() => {
          document.body.classList.remove('animating-right-column');
        });
      });
    },
    [isRightColumnShown],
  );

  const handleBlur = useCallback(() => {
    updateIsOnline(false);

    const initialUnread = selectCountNotMutedUnread(getGlobal());
    let index = 0;

    clearInterval(notificationInterval);
    notificationInterval = window.setInterval(() => {
      if (document.title.includes(INACTIVE_MARKER)) {
        updateIcon(false);
        return;
      }

      if (index % 2 === 0) {
        const newUnread = selectCountNotMutedUnread(getGlobal()) - initialUnread;
        if (newUnread > 0) {
          updatePageTitle(
            `${newUnread} notification${newUnread > 1 ? 's' : ''}`,
          );
          updateIcon(true);
        }
      } else {
        updatePageTitle(PAGE_TITLE);
        updateIcon(false);
      }

      index++;
    }, NOTIFICATION_INTERVAL);
  }, [updateIsOnline]);

  const handleFocus = useCallback(() => {
    updateIsOnline(true);

    clearInterval(notificationInterval);
    notificationInterval = undefined;

    if (!document.title.includes(INACTIVE_MARKER)) {
      updatePageTitle(PAGE_TITLE);
    }

    updateIcon(false);
  }, [updateIsOnline]);

  const handleStickerSetModalClose = useCallback(() => {
    openStickerSetShortName({ stickerSetShortName: undefined });
  }, [openStickerSetShortName]);

  // Online status and browser tab indicators
  useBackgroundMode(handleBlur, handleFocus);
  useBeforeUnload(handleBlur);

  usePreventPinchZoomGesture(isMediaViewerOpen);

  function stopEvent(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault();
    e.stopPropagation();
  }

  return (
    <div
      id="Main"
      className={className}
      onDrop={stopEvent}
      onDragOver={stopEvent}
    >
      <LeftColumn />
      <MiddleColumn />
      <RightColumn />
      <MediaViewer isOpen={isMediaViewerOpen} />
      <ForwardPicker isOpen={isForwardModalOpen} />
      <Notifications isOpen={hasNotifications} />
      <ZoomDialog isOpen={openZoomDialog} />
      <Dialogs isOpen={hasDialogs} />
      {audioMessage && <AudioPlayer key={audioMessage.id} message={audioMessage} noUi />}
      <SafeLinkModal url={safeLinkModalUrl} />
      <HistoryCalendar isOpen={isHistoryCalendarOpen} />
      <StickerSetModal
        isOpen={Boolean(openedStickerSetShortName)}
        onClose={handleStickerSetModalClose}
        stickerSetShortName={openedStickerSetShortName}
      />
      {activeGroupCallId && (
        <>
          <GroupCall groupCallId={activeGroupCallId} />
          <ActiveCallHeader groupCallId={activeGroupCallId} />
        </>
      )}
      <DownloadManager />
      <CallFallbackConfirm isOpen={isCallFallbackConfirmOpen} />
    </div>
  );
};

function updateIcon(asUnread: boolean) {
  document
    .querySelectorAll<HTMLLinkElement>('link[rel="icon"]')
    .forEach((link) => {
      if (asUnread) {
        if (!link.href.includes('favicon-unread')) {
          link.href = link.href.replace('favicon', 'favicon-unread');
        }
      } else {
        link.href = link.href.replace('favicon-unread', 'favicon');
      }
    });
}

// For some reason setting `document.title` to the same value
// causes increment of Chrome Dev Tools > Performance Monitor > DOM Nodes counter
function updatePageTitle(nextTitle: string) {
  if (document.title !== nextTitle) {
    document.title = nextTitle;
  }
}

export default memo(withGlobal(
  (global): StateProps => {
    const { settings: { byKey: { animationLevel, language, wasTimeFormatSetManually } } } = global;
    const { chatId: audioChatId, messageId: audioMessageId } = global.audioPlayer;
    const { currentUserId } = global;
    const { currentUserPhoneNumber } = global;
    const audioMessage = audioChatId && audioMessageId
      ? selectChatMessage(global, audioChatId, audioMessageId)
      : undefined;

    return {
      lastSyncTime: global.lastSyncTime,
      isLeftColumnShown: global.isLeftColumnShown,
      isRightColumnShown: selectIsRightColumnShown(global),
      isMediaViewerOpen: selectIsMediaViewerOpen(global),
      isForwardModalOpen: selectIsForwardModalOpen(global),
      hasNotifications: Boolean(global.notifications.length),
      openZoomDialog: global.zoomDialog?.openModal || false,
      hasDialogs: Boolean(global.dialogs.length),
      audioMessage,
      safeLinkModalUrl: global.safeLinkModalUrl,
      isHistoryCalendarOpen: Boolean(global.historyCalendarSelectedAt),
      shouldSkipHistoryAnimations: global.shouldSkipHistoryAnimations,
      openedStickerSetShortName: global.openedStickerSetShortName,
      isServiceChatReady: selectIsServiceChatReady(global),
      activeGroupCallId: global.groupCalls.activeGroupCallId,
      animationLevel,
      language,
      wasTimeFormatSetManually,
      isCallFallbackConfirmOpen: Boolean(global.groupCalls.isFallbackConfirmOpen),
      currentUserId,
      currentUserPhoneNumber,
      currentUser: currentUserId ? selectUser(global, currentUserId) : undefined,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, [
    'loadAnimatedEmojis', 'loadNotificationSettings', 'loadNotificationExceptions', 'updateIsOnline',
    'loadTopInlineBots', 'loadEmojiKeywords', 'openStickerSetShortName', 'loadCountryList', 'ensureTimeFormat',
    'checkVersionNotification',
  ]),
)(Main));
