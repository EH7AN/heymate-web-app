import { IOffer } from 'src/types/HeymateTypes/Offer.model';
import React, {
  FC,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from '../../../../lib/teact/teact';
import useLang from '../../../../hooks/useLang';
import Button from '../../../ui/Button';

import {
  ReservationStatus,
} from '../../../../types/HeymateTypes/MyOrders.model';
import './Offer.scss';
import OfferDetailsDialog from '../../../common/OfferDetailsDialog';

// @ts-ignore
import offer1 from '../../../../assets/heymate/offer1.svg';
// @ts-ignore
import datetime from '../../../../assets/heymate/date-time.svg';
// @ts-ignore
import play from '../../../../assets/heymate/play.svg';
// @ts-ignore
import time from '../../../../assets/heymate/time.svg';
import TaggedText from '../../../ui/TaggedText';

import MenuItem from '../../../ui/MenuItem';
import Menu from '../../../ui/Menu';
import OfferFooter from './components/OfferFooter';
import VideoSessionDialog from '../../../left/manageOffers/ZoomDialog/VideoSessionDialog';
import { ClientType } from '../../../left/manageOffers/ZoomSdkService/types';
import { ZoomClient } from '../../../left/manageOffers/ZoomSdkService/ZoomSdkService';

type TimeToStart = {
  days: number;
  hours: number;
  minutes: number;
};
type OwnProps = {
  props: IOffer;
};
const Offer: FC<OwnProps> = ({ props }) => {
  const lang = useLang();
  // eslint-disable-next-line no-null/no-null
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [offerHour, setOfferHour] = useState('');
  const [offerStatus, setOfferStatus] = useState<ReservationStatus>(props.selectedSchedule?.status);
  const [timeToStart, setTimeToStart] = useState<TimeToStart>();
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [joinMeetingLoader, setJoinMeetingLoader] = useState(false);
  const [openVideoDialog, setOpenVideoDialog] = useState(false);
  const [zoomStream, setZoomStream] = useState();
  const [zmClient, setZmClient] = useState<ClientType>();
  const [offerStarted, setOfferStarted] = useState(false);
  const [tagStatus, setTagStatus] = useState<{ text: string; color: any }>({
    text: '',
    color: 'green',
  });
  /**
   * Get Ongoing Offer Time To Start
   */
  const getHowMuchDaysUnitllStar = (timestamp) => {
    let ts = timestamp;
    if (ts.length <= 10) {
      ts *= 1000;
    }
    const dateFuture = new Date(parseInt(ts || '', 10));
    const dateNow = new Date();
    // return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));

    let delta = Math.abs(dateFuture.getTime() - dateNow.getTime()) / 1000;

    // calculate (and subtract) whole days
    const days = Math.floor(delta / 86400);
    delta -= days * 86400;

    // calculate (and subtract) whole hours
    const hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;

    // calculate (and subtract) whole minutes
    const minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;
    return {
      days,
      hours,
      minutes,
    };
  };

  useEffect(() => {
    if (props.selectedSchedule) {
      const hour = new Date((parseInt(props.selectedSchedule?.form_time, 10) * 1000));
      setOfferHour(hour.toLocaleTimeString());
    }
    const now = new Date();
    const startTime = new Date(parseInt(props.selectedSchedule?.form_time || '', 10));
    const endTime = new Date(parseInt(props.selectedSchedule?.to_time || '', 10));
    // if (startTime > now) {
    //   setTagStatus({
    //     color: 'green',
    //     text: 'Upcoming',
    //   });
    //   setOfferStatus(ReservationStatus.BOOKED);
    // } else if (startTime < now && endTime > now) {
    //   setTagStatus({
    //     color: 'blue',
    //     text: 'In progress',
    //   });
    //   setOfferStatus(ReservationStatus.INPROGRESS);
    // } else if (endTime < now) {
    //   setTagStatus({
    //     color: 'gray',
    //     text: 'Finished',
    //   });
    //   setOfferStatus(ReservationStatus.FINISHED);
    // }
    switch (props.selectedSchedule?.status) {
      case ReservationStatus.BOOKED:
        setTagStatus({
          color: 'green',
          text: 'Upcoming',
        });
        break;
      case ReservationStatus.FINISHED:
        setTagStatus({
          color: 'gray',
          text: 'Finished',
        });
        break;
      case ReservationStatus.STARTED:
        setTagStatus({
          color: 'blue',
          text: 'In progress',
        });
        break;
      case ReservationStatus.MARKED_AS_STARTED:
        setTagStatus({
          color: 'blue',
          text: 'In progress',
        });
        break;
      case ReservationStatus.CANCELED_BY_SERVICE_PROVIDER:
        setTagStatus({
          color: 'yellow',
          text: 'Pending',
        });
        break;
    }
    if (props?.selectedSchedule?.form_time) {
      const dateFuture = new Date(parseInt(props.selectedSchedule?.form_time || '', 10));
      const dateNow = new Date();
      if (dateFuture.getTime() > dateNow.getTime()) {
        const res: any = getHowMuchDaysUnitllStar(props.selectedSchedule.form_time);
        setTimeToStart(res);
      } else {
        setOfferStarted(true);
        setTimeToStart({ days: 0, minutes: 0, hours: 0 });
      }
    }
  }, [props.selectedSchedule, props.status]);

  const handleHeaderMenuOpen = useCallback(() => {
    setIsMenuOpen(true);
  }, []);

  const handleClose = () => {
    setIsMenuOpen(false);
  };

  const joinMeeting = async (meetingId: string, sessionPassword: string) => {
    setOpenVideoDialog(true);
    const client = new ZoomClient(meetingId, sessionPassword, 'John Doe!');
    setJoinMeetingLoader(true);
    await client.join();

    setZmClient(client.zmClient);
    setZoomStream(client.mediaStream);

    setJoinMeetingLoader(false);
  };
  const handleReservationStatusChanges = (newStatus: ReservationStatus) => {
    setOfferStatus(newStatus);
  };
  const handleCloseVideoDialog = () => {
    setOpenVideoDialog(false);
  };

  return (
    <div className="Offer-middle">
      <div className="offer-content">
        <div className="offer-body">
          <div className="meeting-left-side">
            <div className="avatar-holder">
              <img src={offer1} alt="" />
            </div>
            <div className="offer-details">
              <h4>{`${props.title} - ${offerHour}`}</h4>
              <span className="offer-location">{props.description}</span>
              <div className="offer-status">
                <TaggedText color={tagStatus.color}>
                  {tagStatus.text}
                </TaggedText>
              </div>
            </div>
          </div>
          <div className="meeting-right-side">
            <Button
              ref={menuButtonRef}
              className={isMenuOpen ? 'active' : ''}
              round
              ripple
              onClick={handleHeaderMenuOpen}
              size="smaller"
              color="translucent"
              ariaLabel="More actions"
            >
              <i className="icon-more" />
            </Button>
            <Menu
              className="offer-operation-menu"
              isOpen={isMenuOpen}
              positionX="right"
              positionY="top"
              autoClose
              onClose={handleClose}
            >
              <MenuItem icon="channel" onClick={() => setOpenDetailsModal(true)}>View Details</MenuItem>
              {/* <MenuItem icon="group">Re-Schedule</MenuItem> */}
              <MenuItem icon="user">{lang('Cancel')}</MenuItem>
            </Menu>
          </div>
        </div>
        <OfferFooter
          offerType={props.meeting_type || 'DEFAULT'}
          fromTime={props.selectedSchedule?.form_time}
          toTime={props.selectedSchedule?.to_time}
          timeToStart={timeToStart}
          joinMeetingLoader={joinMeetingLoader}
          status={offerStatus}
          onJoinMeeting={joinMeeting}
          onStatusChanged={handleReservationStatusChanges}
          timeSlotId={props?.selectedSchedule?.id || ''}
        />
      </div>
      <VideoSessionDialog
        isLoading={joinMeetingLoader}
        openModal={openVideoDialog}
        onCloseModal={handleCloseVideoDialog}
        stream={zoomStream}
        zoomClient={zmClient}
      />
      <OfferDetailsDialog
        openModal={openDetailsModal}
        offer={props}
        onCloseModal={() => setOpenDetailsModal(false)}
      />
    </div>
  );
};

export default memo(Offer);