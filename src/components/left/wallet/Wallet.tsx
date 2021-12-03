import React, {
  FC, useEffect, useRef, useState, memo, useMemo,
} from 'teact/teact';
import WalletConnectProvider from '@walletconnect/web3-provider';
import QrCreator from 'qr-creator';
import Web3 from 'web3';
import { newKitFromWeb3 } from '@celo/contractkit';
import { withGlobal } from 'teact/teactn';
import { newKitBalances, sendcUSD } from './AccountManager/AccountMannager';
import useLang from '../../../hooks/useLang';
import Spinner from '../../ui/Spinner';
import Modal from '../../ui/Modal';
import './Wallet.scss';
import Button from '../../ui/Button';
import TransactionRow from './TransactionRow/TransactionRow';
// @ts-ignore
import walletIcon from '../../../assets/heymate/color-wallet.svg';
import { GlobalActions } from '../../../global/types';
import { pick } from '../../../util/iteratees';

export type OwnProps = {
  onReset: () => void;
};

interface IBalance {
  CELO: string;
  cUSD: string;
}

type DispatchProps = Pick<GlobalActions, 'showNotification'>;

const Wallet: FC <OwnProps & DispatchProps> = ({ onReset, showNotification }) => {
  const [openModal, setOpenModal] = useState(false);
  const [loadingQr, setLoadingQr] = useState(true);
  // eslint-disable-next-line no-null/no-null
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const [kit, setKit] = useState<any>();
  const [isConnected, setIsConnected] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [uri, setUri] = useState<string>('');

  const provider = useMemo(() => {
    return new WalletConnectProvider({
      rpc: {
        44787: 'https://alfajores-forno.celo-testnet.org',
        42220: 'https://forno.celo.org',
      },
      qrcode: false,
      // clientMeta: [
      //
      // ],
    });
  }, []);

  const [wcProvider, setWcProvider] = useState<any>(provider);

  const [balance, setBalance] = useState<IBalance>({
    cUSD: '0',
    CELO: '0',
  });
  const lang = useLang();

  const renderUriAsQr = (givenUri?) => {
    setOpenModal(true);
    setLoadingQr(true);

    setTimeout(() => {
      const validUri = givenUri || uri;

      const container = qrCodeRef.current!;
      container.innerHTML = '';
      container.classList.remove('pre-animate');

      QrCreator.render({
        text: `${validUri}`,
        radius: 0.5,
        ecLevel: 'M',
        fill: '#4E96D4',
        size: 280,
      }, container);
      setLoadingQr(false);
    }, 100);
  };

  const handleCLoseWCModal = () => {
    setOpenModal(false);
    provider.isConnecting = false;
    setLoadingBalance(false);
  };

  const handleOpenWCModal = async () => {
    if (uri === '') {
      await provider.enable();
    }
    setOpenModal(true);
    setLoadingQr(true);
    renderUriAsQr();
  };
  /**
   * Get Account Balance
   */
  provider.connector.on('display_uri', (err, payload) => {
    setIsConnected(false);
    const wcUri = payload.params[0];
    setUri(wcUri);

    renderUriAsQr(wcUri);

    setLoadingQr(false);
  });

  const makeKitsFromProvideAndGetBalance = async (address?: string) => {
    // @ts-ignore
    const web3 = new Web3(provider);
    // @ts-ignore
    const myKit = newKitFromWeb3(web3);

    const walletAddress = address || provider.accounts[0];

    const accountBalance = await newKitBalances(myKit, walletAddress);
    setBalance(accountBalance);

    setLoadingBalance(false);

    setKit(myKit);
    setWcProvider(provider);
  };

  provider.on('accountsChanged', (accounts) => {
    console.log(accounts);
  });

  provider.on('disconnect', (code: number, reason: string) => {
    showNotification({ message: reason });
    setIsConnected(false);
    setWcProvider(provider);
  });

  provider.onConnect(() => {
    setOpenModal(false);
    setIsConnected(true);
    showNotification({ message: 'Successfully Connected to Valor !' });
    setWcProvider(provider);
    makeKitsFromProvideAndGetBalance();
  });

  useEffect(() => {
    const reconnectToProvider = async () => {
      await provider.enable()
        .then((res) => {
          setIsConnected(true);
          makeKitsFromProvideAndGetBalance(res[0]);
        });
    };
    if (provider.isWalletConnect) {
      reconnectToProvider();
    } else {
      setLoadingBalance(false);
    }
  }, [provider]);

  const doTransaction = () => {
    sendcUSD(kit).then((res) => {
      console.log(res);
    }).catch((err) => {
      showNotification({ message: err.message });
    });
  };

  return (
    <div className="UserWallet">
      <div className="left-header">
        <Button
          round
          size="smaller"
          color="translucent"
          onClick={onReset}
          ariaLabel="Return to chat list"
        >
          <i className="icon-arrow-left" />
        </Button>
        <h3>{lang('Wallet')}</h3>
      </div>
      <div className="wallet-body">
        <div className="logo-container">
          <img src={walletIcon} alt="" />
        </div>
        <span id="total-balance">Total Balance</span>
        {loadingBalance && (
          <div className="spinner-holder">
            <Spinner color="gray" />
          </div>
        )}
        {(!loadingBalance && isConnected) && (
          <h3 id="balance">$ {balance.cUSD}</h3>
        )}
        {(!loadingBalance && !isConnected) && (
          <span id="balance">Connect Your Account</span>
        )}
        <div className="btn-row">
          {isConnected && (
            <div id="add-money" className="btn-holder">
              <Button onClick={doTransaction} size="smaller" color="primary">
                Add Money
              </Button>
            </div>
          )}
          { (!loadingBalance && !isConnected)
            && (
              <div id="cashout" className="btn-holder">
                <Button onClick={handleOpenWCModal} isText size="smaller" color="primary">
                  <span>Connect</span>
                </Button>
              </div>
            )}
        </div>
      </div>
      <div className="wallet-transactions custom-scroll">
        <h4 id="caption">Transactions</h4>
        <TransactionRow />
        <TransactionRow />
        <TransactionRow />
        <TransactionRow />
        <TransactionRow />
        <TransactionRow />
        <TransactionRow />
        <TransactionRow />
        <TransactionRow />
      </div>
      <Modal
        hasCloseButton
        isOpen={openModal}
        onClose={handleCLoseWCModal}
        onEnter={openModal ? handleCLoseWCModal : undefined}
        className="WalletQrModal"
        title="Wallet Connect"
      >
        {loadingQr && (
          <div className="spinner-holder">
            <Spinner color="blue" />
          </div>
        )}
        <div key="qr-container" className="qr-container pre-animate" ref={qrCodeRef} />
      </Modal>
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (): any => {
    return {
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, [
    'showNotification',
  ]),
)(Wallet));
