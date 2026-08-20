// supabase/migrations/20260820000000_init.sql 과 일치해야 한다.
// 새 프로젝트를 연결한 뒤에는 `npm run gen:types`로 재생성할 것.
// (형태는 supabase gen types typescript의 출력과 맞춰두었다.)

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TombStatus = 'draft' | 'published';
export type EulogySource = 'chatgpt' | 'claude' | 'gemini' | 'other';
export type FlowerType =
  | 'Blossom'
  | 'Bouquet'
  | 'Hibiscus'
  | 'Rose'
  | 'Sunflower'
  | 'Tulip';

export type Database = {
  public: {
    Tables: {
      tombs: {
        Row: {
          user_id: string;
          slug: string;
          status: TombStatus;
          user_name: string | null;
          tomb_name: string | null;
          deathmask: string | null;
          birth_date: string | null;
          death_date: string | null;
          eulogy: string | null;
          eulogy_source: EulogySource | null;
          eulogy_captured_at: string | null;
          onboarding_step: number;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          slug?: string;
          status?: TombStatus;
          user_name?: string | null;
          tomb_name?: string | null;
          deathmask?: string | null;
          birth_date?: string | null;
          death_date?: string | null;
          eulogy?: string | null;
          eulogy_source?: EulogySource | null;
          eulogy_captured_at?: string | null;
          onboarding_step?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          slug?: string;
          status?: TombStatus;
          user_name?: string | null;
          tomb_name?: string | null;
          deathmask?: string | null;
          birth_date?: string | null;
          death_date?: string | null;
          eulogy?: string | null;
          eulogy_source?: EulogySource | null;
          eulogy_captured_at?: string | null;
          onboarding_step?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tombs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      flowers: {
        Row: {
          id: string;
          tomb_id: string;
          flower_type: FlowerType;
          visitor_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tomb_id: string;
          flower_type: FlowerType;
          visitor_hash?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tomb_id?: string;
          flower_type?: FlowerType;
          visitor_hash?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'flowers_tomb_id_fkey';
            columns: ['tomb_id'];
            isOneToOne: false;
            referencedRelation: 'tombs';
            referencedColumns: ['user_id'];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type TombRow = Database['public']['Tables']['tombs']['Row'];
export type FlowerRow = Database['public']['Tables']['flowers']['Row'];
