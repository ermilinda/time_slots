
export interface TimeSlot {
    start_time: string;
    end_time: string;
  }
  
  export interface DataItem {
    id: number;
    name: string;
    time_slots: TimeSlot[];
  }
  
  export interface TimeSlot {
    start_time: string;
    end_time: string;
  }
  
  export interface SelectedSlots {
    [companyName: string]: { start_time: string; end_time: string } | null;
  }
  