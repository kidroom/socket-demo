export interface RoomList {
  room_id: string;
  room_name: string;
}

export class ChatRecord {
  room_id: string;
  user_id: string;
  user_name: string;
  sort: number;
  sender: boolean;
  message: string;
  create_date: Date;

  constructor(data: {
    room_id: string;
    user_id: string;
    user_name: string;
    sort: number;
    sender: boolean;
    message: string;
    create_date: Date;
  }) {
    this.room_id = data.room_id;
    this.user_id = data.user_id;
    this.user_name = data.user_name;
    this.sort = data.sort;
    this.sender = data.sender;
    this.message = data.message;
    this.create_date = data.create_date;
  }
}
