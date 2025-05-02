export class ChatMessageModel {
  sender: string;
  receive: string;
  content: string;

  constructor(data: { sender: string; receive: string; content: string }) {
    this.sender = data.sender;
    this.receive = data.receive;
    this.content = data.content;
  }
}
