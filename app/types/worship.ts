import * as fabric from 'fabric';

export interface Sheet {
  id: string;
  title: string;
  imageUrl: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface DrawingData {
  sheetId: string;
  paths: fabric.Object[];
  createdBy: string;
  createdAt: string;
}

export interface Command {
  id: string;
  type: 'MOVE_PAGE' | 'REPEAT' | 'CUSTOM';
  payload: {
    text: string;
    icon?: string;
    targetPage?: number;
    repeatCount?: number;
  };
  sentBy: string;
  sentAt: string;
}
