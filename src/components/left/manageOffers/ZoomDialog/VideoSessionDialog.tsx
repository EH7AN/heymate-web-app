import React, {
  FC, memo, useCallback, useEffect, useMemo, useRef, useState,
} from 'teact/teact';
import VideoSDK from '@zoom/videosdk';
import Modal from '../../../ui/Modal';
import buildClassName from '../../../../util/buildClassName';
import ZoomVideoFooter from './components/ZoomVideoFooter';
import Loading from '../../../ui/Loading';

import { useShare } from './hooks/useShare';
import { useGalleryLayout } from './hooks/useGalleryLayout';
import { usePagination } from './hooks/usePagination';
import { useCanvasDimension } from './hooks/useCanvasDimension';
import { useActiveVideo } from './hooks/useAvtiveVideo';

import ZoomAvatar from './components/ZoomAvatar';
import './VideoSessionDialog.scss';
import { ReservationStatus } from '../../../../types/HeymateTypes/ReservationStatus';
import { axiosService } from '../../../../api/services/axiosService';
import { HEYMATE_URL } from '../../../../config';
import Button from '../../../ui/Button';

type OwnProps = {
  openModal: boolean;
  onCloseModal: () => void;
  canvasWidth? : number;
  canvasHeight? : number;
  xOffset? : number;
  yOffset? : number;
  videoQuality? : number;
  stream: any;
  zoomClient: any;
  isLoading: boolean;
  reservationId?: string;
  userType?: 'SERVICE_PROVIDER' | 'CONSUMER';
};

const VideoSessionDialog : FC<OwnProps> = ({
  openModal,
  onCloseModal,
  canvasWidth = 640,
  canvasHeight = 360,
  xOffset = 0,
  yOffset = 0,
  videoQuality = 2,
  stream,
  zoomClient,
  isLoading,
  reservationId,
  userType = 'CONSUMER',
}) => {
  // eslint-disable-next-line no-null/no-null
  const videoRef = useRef<HTMLCanvasElement | null>(null);
  // eslint-disable-next-line no-null/no-null
  const shareRef = useRef<HTMLCanvasElement | null>(null);
  // eslint-disable-next-line no-null/no-null
  const selfShareRef = useRef<HTMLCanvasElement & HTMLVideoElement | null>(null);
  // eslint-disable-next-line no-null/no-null
  const shareContainerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line no-null/no-null
  const shareContainerViewPortRef = useRef<HTMLDivElement | null>(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const { isRecieveSharing, isStartedShare, sharedContentDimension } = useShare(
    zoomClient,
    stream,
    shareRef,
  );

  const isSharing = isRecieveSharing || isStartedShare;

  const contentDimension = sharedContentDimension;

  if (isSharing && shareContainerRef.current) {
    const { width, height } = sharedContentDimension;
    const {
      width: containerWidth,
      height: containerHeight,
    } = shareContainerRef.current.getBoundingClientRect();
    const ratio = Math.min(containerWidth / width, containerHeight / height, 1);
    contentDimension.width = Math.floor(width * ratio);
    contentDimension.height = Math.floor(height * ratio);
  }

  useEffect(() => {
    if (shareContainerViewPortRef.current) {
      if (contentDimension.width !== 0) {
        shareContainerViewPortRef.current.style.width = `${contentDimension.width}px`;
      }
      if (contentDimension.height !== 0) {
        shareContainerViewPortRef.current.style.height = `${contentDimension.height}px`;
      }
    }
  }, [contentDimension.height, contentDimension.width, shareContainerViewPortRef]);

  // eslint-disable-next-line no-null/no-null
  const videoCanvas = useRef<HTMLCanvasElement>(null);

  const canvasDimension = useCanvasDimension(stream, videoRef);

  const [isMaximize, setIsMaximize] = useState(true);

  const [isMinimize, setIsMinimize] = useState(false);

  const isSupportWebCodecs = () => {
    return typeof (window as any).MediaStreamTrackProcessor === 'function';
  };

  const activeVideo = useActiveVideo(zoomClient);

  const {
    page, pageSize, totalPage, totalSize, setPage,
  } = usePagination(
    zoomClient,
    canvasDimension,
  );

  const { visibleParticipants, layout: videoLayout } = useGalleryLayout(
    zoomClient,
    stream,
    true,
    videoRef,
    canvasDimension,
    {
      page,
      pageSize,
      totalPage,
      totalSize,
    },
  );

  const audioTrack = useMemo(() => {
    return VideoSDK.createLocalAudioTrack();
  }, []);

  const videoTrack = useMemo(() => {
    return VideoSDK.createLocalVideoTrack();
  }, []);

  const handleCLoseDetailsModal = () => {
    onCloseModal();
  };

  const startVideo = useCallback(async () => {
    const canvas = videoCanvas.current!;
    if (!stream.isCapturingVideo()) {
      try {
        // await stream.startVideo();
        const session = zoomClient.getSessionInfo();
        await stream.startVideo();
        await stream.renderVideo(
          canvas,
          session.userId,
          canvasWidth,
          canvasHeight,
          xOffset,
          yOffset,
          videoQuality,
        );
      } catch (error) {
        console.log(error);
      }
    }
  }, [canvasHeight, canvasWidth, stream, videoQuality, xOffset, yOffset, zoomClient]);

  const stopVideo = useCallback(async () => {
    const canvas = videoCanvas.current!;
    if (stream.isCapturingVideo()) {
      try {
        await stream.stopVideo();
        const session = zoomClient.getSessionInfo();
        stream.stopRenderVideo(canvas, session.userId);
      } catch (error) {
        console.log(error);
      }
    }
  }, [stream, zoomClient]);

  const handleFinishMeeting = async () => {
    let url;
    let status;
    if (userType === 'CONSUMER') {
      url = `${HEYMATE_URL}/reservation/${reservationId}`;
      status = ReservationStatus.FINISHED;
    } else {
      url = `${HEYMATE_URL}/time-table/${reservationId}`;
      status = ReservationStatus.MARKED_AS_FINISHED;
    }
    const response = await axiosService({
      url,
      method: 'PUT',
      body: {
        status,
      },
    });
  };
  const dismissDialog = () => {
    setConfirmModal(false);
  };

  const handleLeaveSessionClick = async () => {
    setConfirmModal(false);
    try {
      await zoomClient.leave();
      await handleFinishMeeting();
      onCloseModal();
    } catch (e) {
      console.error('Error leaving session', e);
    }
  };

  const handleCloseZoomDialog = async () => {
    setConfirmModal(true);
  };

  const handleMaxDialog = () => {
    setIsMaximize(!isMaximize);
  };

  const handleMinDialog = () => {
    setIsMinimize(!isMinimize);
  };

  const ModalHeader = () => {
    return (
      <div className="custom-header">
        <div className="header-actions">
          <i onClick={handleCloseZoomDialog} className="hm-zoom-close" />
          <i onClick={handleMaxDialog} id="zoom-max" className="hm-zoom-maximize" />
          <i onClick={handleMinDialog} id="zoom-min" className="hm-zoom-minimize" />
        </div>
      </div>
    );
  };

  return (
    <Modal
      header={ModalHeader()}
      isOpen={openModal}
      onClose={handleCLoseDetailsModal}
      onEnter={openModal ? handleCLoseDetailsModal : undefined}
      className={
        buildClassName(
          'VideoSessionDialog video-session',
          isMaximize && 'maximize',
          isMinimize && 'minimize',
        )
      }
      title="Zoom Video"
    >
      {isLoading && (
        <div className="wait-to-session-init">
          <Loading key="loading" />
        </div>
      )}
      <div
        className={buildClassName('share-container', isSharing && 'in-sharing')}
        ref={shareContainerRef}
      >
        <div
          className="share-container-viewport"
          ref={shareContainerViewPortRef}
        >
          <canvas
            className={buildClassName('share-canvas', 'other-share', isStartedShare && 'hidden')}
            ref={shareRef}
          />
          {isSupportWebCodecs() ? (
            <video
              className={buildClassName('share-canvas', isRecieveSharing && 'hidden')}
              ref={selfShareRef}
            />
          ) : (
            <canvas
              className={buildClassName('share-canvas', isRecieveSharing && 'hidden')}
              ref={selfShareRef}
            />
          )}
        </div>
      </div>
      <div
        className={buildClassName('video-container', isSharing && 'in-sharing')}
      >
        <canvas
          className="video-canvas"
          id="video-canvas"
          width="800"
          height="350"
          ref={videoRef}
        />
        <ul className="avatar-list">
          {visibleParticipants.map((user, index) => {
            if (index > videoLayout.length - 1) {
              return null;
            }
            const dimension = videoLayout[index];
            const {
              width, height, x, y,
            } = dimension;
            const { height: canvasHeight } = canvasDimension;
            const userId = JSON.parse(user.displayName).id;
            return (
              <ZoomAvatar
                currentUserId={userId}
                participant={user}
                key={user.userId}
                isActive={activeVideo === user.userId}
                style={{
                  width: `${width}px`,
                  height: `${height}px`,
                  top: `${canvasHeight - y - height}px`,
                  left: `${x}px`,
                }}
              />
            );
          })}
        </ul>
      </div>
      <ZoomVideoFooter
        sharing={isStartedShare}
        shareRef={selfShareRef}
        zmClient={zoomClient}
        mediaStream={stream}
        initLeaveSessionClick={() => setConfirmModal(true)}
      />
      <Modal
        isOpen={confirmModal}
        onClose={dismissDialog}
        className="error"
        title="End Session"
      >
        <p>Are you sure you want end to end this session ?</p>
        <div className="confirm-end-session">
          <Button isText className="confirm-dialog-button" onClick={handleLeaveSessionClick}>Yes</Button>
          <Button isText className="confirm-dialog-button" onClick={() => setConfirmModal(false)}>No</Button>
        </div>
      </Modal>
    </Modal>
  );
};

export default memo(VideoSessionDialog);
