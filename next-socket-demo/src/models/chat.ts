export interface RoomList {
  room_id: string;
  room_name: string;
}

export class ChatRecord {
  room_id: string;
  user_id: string;
  sort: number;
  sender: number;
  message: string;
  createDate: Date;

  constructor(data: {
    room_id: string;
    user_id: string;
    sort: number;
    sender: number;
    message: string;
    createDate: Date;
  }) {
    this.room_id = data.room_id;
    this.user_id = data.user_id;
    this.sort = data.sort;
    this.sender = data.sender;
    this.message = data.message;
    this.createDate = data.createDate;
  }
}
