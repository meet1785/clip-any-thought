// Shared types for clip editing functionality

export interface Clip {
  id: string;
  title: string;
  start_time: number;
  end_time: number;
  viral_score: number;
  description: string;
}

export interface EditedClip {
  id: string;
  title: string;
  start_time: number;
  end_time: number;
  description: string;
  viral_score: number;
  captions: string;
  audio_url: string;
  is_edited: boolean;
  edited_at: string;
}

export interface Caption {
  text: string;
  startTime: number;
  endTime: number;
  position: 'top' | 'center' | 'bottom';
}
