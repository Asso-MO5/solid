import type { OutputData } from "@editorjs/editorjs";

// Types pour l'éditeur de texte
export interface EditorContent {
  text: string;
}

// Configuration de l'éditeur
export interface EditorConfig {
  id?: string;
  placeholder?: string;
  minHeight?: number;
  maxImageSize?: number; // en MB
  enableImages?: boolean;
  enableLinks?: boolean;
  enableLists?: boolean;
  enableHeaders?: boolean;
  enableMarker?: boolean; // Souligné
  enableQuote?: boolean; // Citation
  enableCode?: boolean; // Code
  enableDelimiter?: boolean; // Séparateur
  i18n?: {
    messages?: Record<string, unknown>;
  };
}

// Interface pour les blocs EditorJS
export interface EditorBlock {
  type: string;
  data: {
    text?: string;
    file?: {
      url: string;
    };
    url?: string;
    caption?: string;
    level?: number;
    items?: string[];
    style?: string; // Pour les listes (ordered/unordered)
    code?: string; // Pour les blocs de code
    alignment?: string; // Pour l'alignement
    // Structure spécifique pour les images EditorJS
    image?: {
      url: string;
      caption?: string;
      withBorder?: boolean;
      withBackground?: boolean;
      stretched?: boolean;
    };
  };
}

// Interface pour les données EditorJS
export interface EditorData {
  blocks: EditorBlock[];
}

// Callbacks de l'éditeur
export interface EditorCallbacks {
  onChange?: (content: OutputData) => void;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

// Métadonnées d'image
export interface ImageMetadata {
  mimeType: string;
  sizeInBytes: number;
  sizeInMB: number;
}
