import { ReservationStatus } from './ReservationStatus';

export interface ITimeSlotModel {
  id: string;
  offerId: string;
  form_time: string;
  to_time: string;
  updated_at: string;
  created_at: string;
  status?: ReservationStatus;
  meetingId?: string;
  meetingPassword?: string;
}
