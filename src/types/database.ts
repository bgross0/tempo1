export type Profile = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type UserSettings = {
  id: string;
  working_hours_start: string;
  working_hours_end: string;
  default_task_duration: number;
  default_chunk_duration: number;
  task_scheduling_strategy: string;
  default_view: string;
  default_calendar_view: string;
  primary_color: string;
  theme: string;
  notifications_enabled: boolean;
  notification_time: number;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  user_id: string;
  project_id: string | null;
  name: string;
  description: string | null;
  start_date: string | null;
  start_time: string | null;
  due_date: string;
  due_time: string | null;
  priority: 'high' | 'medium' | 'low';
  duration: number;
  chunk_size: number | null;
  hard_deadline: boolean;
  completed: boolean;
  completed_at: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type ScheduledBlock = {
  id: string;
  task_id: string;
  date: string;
  start_minute: number;
  duration: number;
  start_time: string;
  end_time: string;
  created_at: string;
};

export type Project = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  start_date: string;
  due_date: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  completed_at: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type Event = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  location: string | null;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type SharedTask = {
  id: string;
  task_id: string;
  shared_with: string;
  permission: 'view' | 'edit';
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  related_entity_id: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_settings: {
        Row: UserSettings;
        Insert: Partial<Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Event, 'id' | 'created_at' | 'updated_at'>>;
      };
      scheduled_blocks: {
        Row: ScheduledBlock;
        Insert: Omit<ScheduledBlock, 'id' | 'created_at'>;
        Update: Partial<Omit<ScheduledBlock, 'id' | 'created_at'>>;
      };
      shared_tasks: {
        Row: SharedTask;
        Insert: Omit<SharedTask, 'id' | 'created_at'>;
        Update: Partial<Omit<SharedTask, 'id' | 'created_at'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>;
      };
    };
    Functions: {
      get_available_time_slots: {
        Args: {
          p_user_id: string;
          p_start_date: string;
          p_end_date: string;
        };
        Returns: {
          day: string;
          start_time: string;
          end_time: string;
        }[];
      };
      schedule_user_tasks: {
        Args: {
          user_id_param: string;
        };
        Returns: void;
      };
    };
  };
};
