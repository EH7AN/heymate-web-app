import React, {
  FC,
  useState,
  useRef,
  useCallback,
  useEffect,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalState, GlobalActions } from '../../../global/types';
import { LeftColumnContent, SettingsScreens } from '../../../types';
import { FolderEditDispatch } from '../../../hooks/reducers/useFoldersReducer';

import { IS_TOUCH_ENV } from '../../../util/environment';
import { pick } from '../../../util/iteratees';
import buildClassName from '../../../util/buildClassName';
import useBrowserOnline from '../../../hooks/useBrowserOnline';
import useFlag from '../../../hooks/useFlag';
import useShowTransition from '../../../hooks/useShowTransition';
import useLang from '../../../hooks/useLang';

import Transition from '../../ui/Transition';
import LeftMainHeader from './LeftMainHeader';
import ConnectionState from '../ConnectionState';
import ChatFolders from './ChatFolders';
import LeftSearch from '../search/LeftSearch.async';
import ContactList from './ContactList.async';
import NewChatButton from '../NewChatButton';
import ShowTransition from '../../ui/ShowTransition';
import Button from '../../ui/Button';

import './LeftMain.scss';

type OwnProps = {
  content: LeftColumnContent;
  searchQuery?: string;
  searchDate?: number;
  contactsFilter: string;
  shouldSkipTransition?: boolean;
  foldersDispatch: FolderEditDispatch;
  onSearchQuery: (query: string) => void;
  onContentChange: (content: LeftColumnContent) => void;
  onScreenSelect: (screen: SettingsScreens) => void;
  onReset: () => void;
};

type DispatchProps = Pick<GlobalActions, 'setShowHeymate' | 'setShowHeymateWalletMiddle'>;

type StateProps = Pick<GlobalState, 'connectionState'>;

const TRANSITION_RENDER_COUNT = Object.keys(LeftColumnContent).length / 2;
const BUTTON_CLOSE_DELAY_MS = 250;
const APP_OUTDATED_TIMEOUT = 3 * 24 * 60 * 60 * 1000; // 3 days

let closeTimeout: number | undefined;

const LeftMain: FC<OwnProps & StateProps & DispatchProps> = ({
  content,
  searchQuery,
  searchDate,
  contactsFilter,
  shouldSkipTransition,
  foldersDispatch,
  onSearchQuery,
  onContentChange,
  onScreenSelect,
  onReset,
  connectionState,
  setShowHeymate,
  setShowHeymateWalletMiddle,
}) => {
  const [isNewChatButtonShown, setIsNewChatButtonShown] = useState(IS_TOUCH_ENV);

  const isBrowserOnline = useBrowserOnline();
  const isConnecting = !isBrowserOnline || connectionState === 'connectionStateConnecting';

  const isMouseInside = useRef(false);
  const [width, setWidth] = useState(0);

  const handleSelectSettings = useCallback(() => {
    onContentChange(LeftColumnContent.Settings);
  }, [onContentChange]);

  const handleSelectContacts = useCallback(() => {
    onContentChange(LeftColumnContent.Contacts);
  }, [onContentChange]);

  const handleSelectNewChannel = useCallback(() => {
    onContentChange(LeftColumnContent.NewChannelStep1);
  }, [onContentChange]);

  const handleSelectNewGroup = useCallback(() => {
    onContentChange(LeftColumnContent.NewGroupStep1);
  }, [onContentChange]);

  const handleSelectArchived = useCallback(() => {
    onContentChange(LeftColumnContent.Archived);
  }, [onContentChange]);

  /**
   * Ali's To Handle Show Offers In Middle Screen
   */
  const handleSelectManageOffers = useCallback(() => {
    if (width > 500) {
      setShowHeymate({ showHeymate: true });
      setShowHeymateWalletMiddle({showHeymateWalletMiddle: false });
    } else {
      onContentChange(LeftColumnContent.Offers);
    }
  }, [setShowHeymate, onContentChange, width, setShowHeymateWalletMiddle]);
  /**
   * Ehsan's To Handle Show Offers In Left Screen
   */
  // const handleSelectManageOffers = useCallback(() => {
  //   onContentChange(LeftColumnContent.Offers);
  // }, [onContentChange]);

  const handleSelectWallet = useCallback(() => {
    if (width < 500) {
      onContentChange(LeftColumnContent.wallet);
    } else {
      setShowHeymateWalletMiddle({showHeymateWalletMiddle: true });
      setShowHeymate({ showHeymate: false });
    }
  }, [onContentChange, setShowHeymateWalletMiddle, width, setShowHeymate]);

  const handleMouseEnter = useCallback(() => {
    if (content !== LeftColumnContent.ChatList) {
      return;
    }
    isMouseInside.current = true;
    setIsNewChatButtonShown(true);
  }, [content]);

  const handleMouseLeave = useCallback(() => {
    isMouseInside.current = false;

    if (closeTimeout) {
      clearTimeout(closeTimeout);
      closeTimeout = undefined;
    }

    closeTimeout = window.setTimeout(() => {
      if (!isMouseInside.current) {
        setIsNewChatButtonShown(false);
      }
    }, BUTTON_CLOSE_DELAY_MS);
  }, []);

  useEffect(() => {
    let autoCloseTimeout: number | undefined;
    if (content !== LeftColumnContent.ChatList) {
      autoCloseTimeout = window.setTimeout(() => {
        setIsNewChatButtonShown(false);
      }, BUTTON_CLOSE_DELAY_MS);
    } else if (isMouseInside.current || IS_TOUCH_ENV) {
      setIsNewChatButtonShown(true);
    }

    return () => {
      if (autoCloseTimeout) {
        clearTimeout(autoCloseTimeout);
        autoCloseTimeout = undefined;
      }
    };
  }, [content]);

  useEffect(() => {
    setWidth(window.innerWidth);
  }, []);

  const [shouldRenderUpdateButton, updateButtonClassNames, handleUpdateClick] = useAppOutdatedCheck();

  const lang = useLang();

  return (
    <div
      id="LeftColumn-main"
      onMouseEnter={!IS_TOUCH_ENV ? handleMouseEnter : undefined}
      onMouseLeave={!IS_TOUCH_ENV ? handleMouseLeave : undefined}
    >
      <LeftMainHeader
        content={content}
        contactsFilter={contactsFilter}
        onSearchQuery={onSearchQuery}
        onSelectSettings={handleSelectSettings}
        onSelectContacts={handleSelectContacts}
        onSelectArchived={handleSelectArchived}
        onSelectManageOffers={handleSelectManageOffers}
        onSelectWallet={handleSelectWallet}
        onReset={onReset}
        shouldSkipTransition={shouldSkipTransition}
      />
      <ShowTransition
        isOpen={isConnecting}
        isCustom
        className="connection-state-wrapper opacity-transition slow"
      >
        {() => <ConnectionState />}
      </ShowTransition>
      <Transition
        name={shouldSkipTransition ? 'none' : 'zoom-fade'}
        renderCount={TRANSITION_RENDER_COUNT}
        activeKey={content}
        shouldCleanup
        cleanupExceptionKey={LeftColumnContent.ChatList}
        className={isConnecting ? 'pull-down' : undefined}
      >
        {(isActive) => {
          switch (content) {
            case LeftColumnContent.ChatList:
              return (
                <ChatFolders
                  onScreenSelect={onScreenSelect}
                  foldersDispatch={foldersDispatch}
                />
              );
            case LeftColumnContent.GlobalSearch:
              return (
                <LeftSearch
                  searchQuery={searchQuery}
                  searchDate={searchDate}
                  isActive={isActive}
                  onReset={onReset}
                />
              );
            case LeftColumnContent.Contacts:
              return (
                <ContactList
                  filter={contactsFilter}
                  isActive={isActive}
                  onReset={onReset}
                />
              );
            default:
              return undefined;
          }
        }}
      </Transition>
      {shouldRenderUpdateButton && (
        <Button
          fluid
          pill
          className={buildClassName('btn-update', updateButtonClassNames)}
          onClick={handleUpdateClick}
        >
          {lang('lng_update_telegram')}
        </Button>
      )}
      <NewChatButton
        isShown={isNewChatButtonShown}
        onNewPrivateChat={handleSelectContacts}
        onNewChannel={handleSelectNewChannel}
        onNewGroup={handleSelectNewGroup}
      />
    </div>
  );
};

function useAppOutdatedCheck() {
  const [isAppOutdated, markIsAppOutdated] = useFlag(false);

  useEffect(() => {
    const timeout = window.setTimeout(markIsAppOutdated, APP_OUTDATED_TIMEOUT);

    return () => {
      clearTimeout(timeout);
    };
  }, [markIsAppOutdated]);

  const { shouldRender, transitionClassNames } = useShowTransition(isAppOutdated);

  const handleUpdateClick = () => {
    window.location.reload();
  };

  return [shouldRender, transitionClassNames, handleUpdateClick] as const;
}

export default withGlobal<OwnProps>(
  (global): StateProps => pick(global, ['connectionState', 'showHeymate']),
  (setGlobal, actions): DispatchProps => pick(actions, ['setShowHeymate', 'setShowHeymateWalletMiddle']),
)(LeftMain);
