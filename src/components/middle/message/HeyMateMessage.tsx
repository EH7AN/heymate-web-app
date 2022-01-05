import React, {
  FC, memo, useCallback, useEffect, useState, useMemo, useRef,
} from '../../../lib/teact/teact';
import RadioGroup from '../../ui/RadioGroup';
import Button from '../../ui/Button';
import { ApiMessage } from '../../../api/types';
import { axiosService } from '../../../api/services/axiosService';
import { HEYMATE_URL } from '../../../config';
import { IOffer } from '../../../types/HeymateTypes/Offer.model';
import OfferDetailsDialog from '../../common/OfferDetailsDialog';
import BookOfferDialog from '../../common/BookOfferDialog';
import { ReservationStatus } from '../../../types/HeymateTypes/ReservationStatus';
import './HeyMateMessage.scss';
// eslint-disable-next-line import/extensions
import GenerateNewDate from '../helpers/generateDateBasedOnTimeStamp';
import { ZoomClient } from '../../left/manageOffers/ZoomSdkService/ZoomSdkService';
import { ClientType } from '../../left/manageOffers/ZoomSdkService/types';
import VideoSessionDialog from '../../left/manageOffers/ZoomDialog/VideoSessionDialog';
import { withGlobal } from 'teact/teactn';
import { selectUser } from '../../../modules/selectors';
import { pick } from '../../../util/iteratees';
import { GlobalActions } from '../../../global/types';
import WalletConnectProvider from '@walletconnect/web3-provider';
import QrCreator from 'qr-creator';
import Modal from '../../ui/Modal';
import Spinner from '../../ui/Spinner';
import { ContractKit, newKitFromWeb3 } from '@celo/contractkit';
import { ReservationModel } from 'src/types/HeymateTypes/Reservation.model';
import OfferWrapper from '../../left/wallet/OfferWrapper';
import Web3 from 'web3';

type OwnProps = {
  message: ApiMessage;
};
type DispatchProps = Pick<GlobalActions, 'openZoomDialogModal'>;
interface IPurchasePlan {
  value: string;
  label: string;
  subLabel: string;
}
type PlanType = 'SINGLE' | 'BUNDLE' | 'SUBSCRIPTION';

const HeyMateMessage: FC<OwnProps & DispatchProps> = ({
  message,
  openZoomDialogModal,
}) => {
  /**
   * Get Heymate Offer
   * @param uuid
   */
  const [renderType, setRenderType] = useState<'OFFER' | 'RESERVATION'>('OFFER');
  const [offerMsg, setOfferMsg] = useState<IOffer>();
  const [offerLoaded, setOfferLoaded] = useState<boolean>(false);
  const [reservationLoaded, setReservationLoaded] = useState<boolean>(false);
  const [reservationId, setReservationId] = useState<string>('');
  const [reservationItem, setReservationItem] = useState<ReservationModel>('');
  const [purchasePlan, setPurchasePlan] = useState<IPurchasePlan[]>([]);
  const [zoomStream, setZoomStream] = useState();
  const [zmClient, setZmClient] = useState<ClientType>();
  const [joinMeetingLoader, setJoinMeetingLoader] = useState(false);
  const [openVideoDialog, setOpenVideoDialog] = useState(false);
  const [canJoin, setCanJoin] = useState(false);

  const [bundlePrice, setBundlePrice] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  const [meetingData, setMeetingData] = useState<any>(undefined);

  const [openQrModal, setOpenQRModal] = useState(false);
  const [loadingQr, setLoadingQr] = useState(true);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [uri, setUri] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);


  const handleExpired = (expireTime: any) => {
    const now = new Date();
    const startTime = GenerateNewDate(expireTime);
    if (now.getTime() < startTime.getTime()) {
      setIsExpired(false);
    } else {
      setIsExpired(true);
    }
  };

  async function getOfferById(uuid) {
    const response = await axiosService({
      url: `${HEYMATE_URL}/offer/${uuid}`,
      method: 'GET',
      body: {},
    });
    if (response && response.status === 200) {
      handleExpired(response.data.data.expiration);
      setOfferLoaded(true);
      setOfferMsg(response.data.data);
    } else {
      setOfferLoaded(false);
    }
  }

  const handleCloseVideoDialog = () => {
    setOpenVideoDialog(false);
  };

  /**
   * Get Reservation By Time Slot Id
   * @param tsId
   * @param userId
   */
  const getReservationByTimeSlotId = async (tsId: string, userId: string | null) => {
    const response = await axiosService({
      url: `${HEYMATE_URL}/reservation/find-by-tsid?timeSlotId=${tsId}&consumerId=${userId}`,
      method: 'GET',
      body: {},
    });
    if ((response.data.data.length > 0) && response.status === 200) {
      const reservationData = response.data.data[0];
      getOfferById(reservationData.offerId);
      setReservationItem(reservationData);
      if (reservationData.status === ReservationStatus.MARKED_AS_STARTED) {
        setCanJoin(true);
        setReservationId(reservationData.id);
        setReservationLoaded(true);
      } else {
        setCanJoin(false);
        setReservationLoaded(true);
      }
    } else {
      setReservationLoaded(false);
    }
  };


  const provider = useMemo(() => {
    return new WalletConnectProvider({
      rpc: {
        44787: 'https://alfajores-forno.celo-testnet.org',
        42220: 'https://forno.celo.org',
      },
      qrcode: false,
      clientMeta: {
        description: 'Just a test description !',
        icons: [],
        url: 'www.ehsan.com',
        name: 'Heymate App',
      },
    });
  }, []);
  const renderUriAsQr = (givenUri?) => {
    setOpenQRModal(true);
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
  const handleOpenWCModal = async () => {
    if (uri === '') {
      await provider.enable();
    }
    setOpenQRModal(true);
    setLoadingQr(true);
    renderUriAsQr();
  };
  provider.connector.on('display_uri', (err, payload) => {
    setIsConnected(false);
    const wcUri = payload.params[0];
    setUri(wcUri);
    renderUriAsQr(wcUri);
    setLoadingQr(false);
  });

  const handleCLoseWCModal = () => {
    setOpenQRModal(false);
    provider.isConnecting = false;
    setLoadingBalance(false);
  };

  useEffect(() => {
    let offerId;
    if (message.content.text?.text.includes('Heymate meeting')) {
      setRenderType('RESERVATION');
      const meetingDetails = message.content.text.text.split('/');
      setMeetingData({
        title: meetingDetails[1],
        topic: meetingDetails[2],
        pass: meetingDetails[3],
        tsId: meetingDetails[4],
        telegramId: meetingDetails[5],
        userName: meetingDetails[6],
      });
      if (localStorage.getItem('HM_USERID')) {
        const userId = localStorage.getItem('HM_USERID');
        if (meetingDetails[4]) {
          getReservationByTimeSlotId(meetingDetails[4], userId);
        } else {
          setReservationLoaded(false);
        }
      } else {
        setReservationLoaded(false);
      }
    } else {
      const matches = message.content.text?.text.split(/offer\/([a-f\d-]+)\?/);
      if (matches && matches.length > 0) {
        // eslint-disable-next-line prefer-destructuring
        offerId = matches[1];
        getOfferById(offerId);
      }
    }
  }, [message]);

  useEffect(() => {
    if (reservationId) {
      setReservationId(reservationId);
    }
  }, [reservationId]);

  const [selectedReason, setSelectedReason] = useState('single');
  const handleSelectType = useCallback((value: string) => {
    setSelectedReason(value);
  }, []);

  useEffect(() => {
    if (offerMsg && purchasePlan.length === 0) {
      const temp: IPurchasePlan[] = [];
      if (offerMsg?.pricing?.bundle || offerMsg?.pricing?.subscription) {
        if (offerMsg.pricing) {
          temp.push({
            label: 'Single',
            value: 'single',
            subLabel: '1 Session',
          });
        }
        // if (offerMsg.pricing.bundle) {
        //   let total = offerMsg.pricing.bundle.count * offerMsg.pricing.price;
        //   let discount = 0;
        //   if (offerMsg.pricing.bundle.discount_percent) {
        //     discount = (total * offerMsg.pricing.bundle.discount_percent) / 100;
        //   }
        //   total -= discount;
        //   setBundlePrice(total);
        //   temp.push({
        //     label: 'Bundle',
        //     value: 'bundle',
        //     subLabel: `${offerMsg.pricing.bundle.count} Sessions`,
        //   });
        // }
        // if (offerMsg.pricing.subscription) {
        //   temp.push({
        //     label: 'Subscription',
        //     value: 'subscription',
        //     subLabel: `${offerMsg.pricing.subscription.period}`,
        //   });
        // }
        setPurchasePlan(temp);
      }
    }
  }, [purchasePlan, offerMsg]);
  /**
   * Heymate Message Type
   */
  // ============== Offer Details Modal
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const handleCLoseDetailsModal = () => {
    setOpenDetailsModal(false);
  };
  const handleOpenDetailsModal = () => {
    setOpenDetailsModal(true);
  };
  // ============ Book Offer Modal
  const [openBookOfferModal, setOpenBookOfferModal] = useState(false);
  const handleCLoseBookOfferModal = () => {
    setOpenBookOfferModal(false);
  };
  const handleOpenBookOfferModal = () => {
    setOpenBookOfferModal(true);
  };

  const [planType, setPlanType] = useState<PlanType>('SINGLE');

  const handleBookOfferClicked = (plan: PlanType) => {
    setPlanType(plan);
    setOpenDetailsModal(false);
    setOpenBookOfferModal(true);
  };

  const joinMeeting = async () => {
    const meetingId = meetingData.topic;
    const sessionPassword = meetingData.pass;

    const userData:any = {
      firstName: meetingData.userName,
      id: meetingData.telegramId,
    };
    const zoomUser = JSON.stringify(userData);

    const client = new ZoomClient(meetingId, sessionPassword, zoomUser);
    setJoinMeetingLoader(true);
    await client.join();

    openZoomDialogModal({
      openModal: true,
      stream: client.mediaStream,
      zoomClient: client.zmClient,
      isLoading: joinMeetingLoader,
      reservationId,
      userType: 'CONSUMER',
    });

    setZmClient(client.zmClient);
    setZoomStream(client.mediaStream);

    setJoinMeetingLoader(false);
  };

  const handleChangeReservationStatus = async (id: string, newStatus: ReservationStatus) => {
    // setIsLoading(true);
    const response = await axiosService({
      url: `${HEYMATE_URL}/reservation/${reservationId}`,
      method: 'PUT',
      body: {
        status: newStatus,
      },
    });
    // setIsLoading(false);
    if (response?.status === 200) {
      joinMeeting();
    }
  };

  const handleStartInCelo = async () => {
    let kit: ContractKit;
    let address: string = '';
    if (provider.isWalletConnect) {
      await provider.enable().then((res) => {
        // eslint-disable-next-line prefer-destructuring
        address = res[0];
        setIsConnected(true);
        setOpenQRModal(false);
      });
      // @ts-ignore
      const web3 = new Web3(provider);
      // @ts-ignoreffer
      kit = newKitFromWeb3(web3);
      const accounts = await kit.web3.eth.getAccounts();
      // eslint-disable-next-line prefer-destructuring
      kit.defaultAccount = accounts[0];
      const offerWrapper = new OfferWrapper(address, kit, false, provider);
      const answer = await offerWrapper.startService(offerMsg, reservationItem.tradeId, address);
      if (answer) {
        handleChangeReservationStatus(reservationItem.id, ReservationStatus.STARTED);
      } else {
        console.log('failed');
      }
    } else {
      handleOpenWCModal();
    }
  };

  // @ts-ignore
  return (
    <div>
      { (renderType === 'OFFER') && offerLoaded && (
        <>
          <div className="HeyMateMessage">
            <div className="my-offer-body">
              <div className="my-offer-img-holder">
                <img src="https://picsum.photos/200/300" alt="" />
              </div>
              <div className="my-offer-descs">
                <h4 className="title">{offerMsg?.title}</h4>
                <span className="sub-title">{offerMsg?.category.main_cat}</span>
                <p className="description">
                  {offerMsg?.description}
                </p>
              </div>
              <div className="my-offer-types">
                <div className="radios-grp">
                  <RadioGroup
                    name="report-message"
                    options={purchasePlan}
                    onChange={handleSelectType}
                    selected={selectedReason}
                  />
                </div>
                <div className="price-grp">
                  <span className="prices active">{`${offerMsg?.pricing?.price} ${offerMsg?.pricing?.currency}`}</span>
                  {/* <span className="prices">{`${bundlePrice}  ${offerMsg?.pricing?.currency}`}</span> */}
                  {/* <span className="prices"> */}
                  {/*  {`${offerMsg?.pricing?.subscription?.subscription_price}  ${offerMsg?.pricing?.currency}`} */}
                  {/* </span> */}
                </div>
              </div>
              {/* <div className="refer-offer"> */}
              {/*  <div className="refer-offer-container"> */}
              {/*    <i className="hm-gift" /> */}
              {/*    <span>Refer this offer to and eran <i className="gift-price">$10</i></span> */}
              {/*    <i className="hm-arrow-right" /> */}
              {/*  </div> */}
              {/* </div> */}
            </div>
            <div className="my-offer-btn-group">
              <Button onClick={handleOpenDetailsModal} className="see-details" size="smaller" color="secondary">
                See Details
              </Button>
              <Button
                disabled={isExpired}
                onClick={handleOpenBookOfferModal}
                className="book-offer"
                size="smaller"
                color="primary"
              >
                <span>Book Now</span>
              </Button>
            </div>
          </div>
          <BookOfferDialog
            purchasePlanType={planType}
            offer={offerMsg}
            openModal={openBookOfferModal}
            onCloseModal={handleCLoseBookOfferModal}
          />
          <OfferDetailsDialog
            onBookClicked={handleBookOfferClicked}
            message={message}
            openModal={openDetailsModal}
            offer={offerMsg}
            expired={isExpired}
            onCloseModal={handleCLoseDetailsModal}
          />
        </>
      )}
      {(renderType === 'OFFER') && !offerLoaded && (
        <div
          className="message-content text has-action-button
            is-forwarded has-shadow has-solid-background has-appendix"
        >
          <span className="normal-message">{message.content.text?.text}</span>
        </div>
      )}
      {
        (renderType === 'RESERVATION') && reservationLoaded && (
          <div className="HeyMateMessage">
            <div className="my-offer-body">
              <div className="my-offer-descs">
                <h4 className="title">Your Meeting :</h4>
                <span className="sub-title">{meetingData.title}</span>
                <p className="description">
                  has started, click join button to start !
                </p>
              </div>
            </div>
            <div className="my-offer-btn-group">
              <Button
                isLoading={joinMeetingLoader}
                disabled={!canJoin}
                onClick={handleStartInCelo}
                className="book-offer"
                size="smaller"
                color="primary"
              >
                <span>Join</span>
              </Button>
            </div>
            {/*<VideoSessionDialog*/}
            {/*  reservationId={reservationId}*/}
            {/*  isLoading={joinMeetingLoader}*/}
            {/*  openModal={openVideoDialog}*/}
            {/*  onCloseModal={handleCloseVideoDialog}*/}
            {/*  stream={zoomStream}*/}
            {/*  zoomClient={zmClient}*/}
            {/*/>*/}
          </div>
        )
      }
      {
        (renderType === 'RESERVATION') && !reservationLoaded && (
          <div
            className="message-content text has-action-button
              is-forwarded has-shadow has-solid-background has-appendix"
          >
            <span className="normal-message">{message.content.text?.text}</span>
          </div>
        )
      }
      <Modal
        hasCloseButton
        isOpen={openQrModal}
        onClose={handleCLoseWCModal}
        onEnter={openQrModal ? handleCLoseWCModal : undefined}
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
  () => {
    return {
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, [
    'openZoomDialogModal',
  ]),
)(HeyMateMessage));
