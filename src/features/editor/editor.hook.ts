import { createSignal, onMount, onCleanup } from 'solid-js';
import type { EditorConfig, EditorCallbacks, EditorData } from './editor.types';
import { createImageUploader } from './editor.utils';
import type EditorJS from '@editorjs/editorjs';
import type { OutputData } from '@editorjs/editorjs';

export const useEditor = (
  config: EditorConfig = {},
  callbacks: EditorCallbacks = {},
  initialData?: EditorData | null,
  editorId?: string
) => {
  const [editor, setEditor] = createSignal<EditorJS | null>(null);
  const [isClient, setIsClient] = createSignal(false);
  const [isReady, setIsReady] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const defaultConfig: EditorConfig = {
    id: 'editorjs',
    placeholder: 'Commencez à écrire...',
    minHeight: 200,
    maxImageSize: 5,
    enableImages: true,
    enableLinks: true,
    enableLists: true,
    enableHeaders: true,
    enableMarker: true,
    enableQuote: true,
    enableCode: true,
    enableDelimiter: true,
    i18n: {
      messages: {
        blockTunes: {
          paragraph: 'Paragraphe',
          text: 'Texte',
          header: 'Titre',
          list: 'Liste',
          quote: 'Citation',
          code: 'Code',
          image: 'Image',
          link: 'Lien',
          marker: 'Surlignage',
          delimiter: 'Séparateur'
        },
        toolNames: {
          'Text': 'Texte',
          'Heading': 'Titre',
          'List': 'Liste',
          'Quote': 'Citation',
          'Code': 'Code',
          'Image': 'Image',
          'Link': 'Lien',
          'Marker': 'Surlignage',
          'Delimiter': 'Séparateur'
        },
        tools: {
          list: {
            'Ordered List': 'Liste numérotée',
            'Unordered List': 'Liste à puces',
            'Add': 'Ajouter',
            'Delete': 'Supprimer',
            'Add item': 'Ajouter un élément',
            'Delete item': 'Supprimer l\'élément',
            'Move up': 'Monter',
            'Move down': 'Descendre'
          },
          header: {
            'Heading': 'Titre',
            'Heading 1': 'Titre 1',
            'Heading 2': 'Titre 2',
            'Heading 3': 'Titre 3',
            'Heading 4': 'Titre 4',
            'Heading 5': 'Titre 5',
            'Heading 6': 'Titre 6'
          },
          quote: {
            'Quote': 'Citation',
            'Enter a quote': 'Entrez une citation',
            'Quote text': 'Texte de la citation',
            'Quote caption': 'Auteur de la citation',
            'Add quote': 'Ajouter une citation',
            'Edit quote': 'Modifier la citation',
            'Remove quote': 'Supprimer la citation'
          },
          code: {
            'Code': 'Code',
            'Enter a code': 'Entrez du code',
            'Code block': 'Bloc de code',
            'Add code': 'Ajouter du code',
            'Edit code': 'Modifier le code',
            'Remove code': 'Supprimer le code',
            'Language': 'Langage'
          },
          image: {
            'Image': 'Image',
            'Select an Image': 'Sélectionnez une image',
            'Upload an Image': 'Téléchargez une image',
            'With URL': 'Avec URL',
            'Upload by File': 'Télécharger un fichier',
            'Enter image URL': 'Entrez l\'URL de l\'image',
            'Caption': 'Légende',
            'Add caption': 'Ajouter une légende',
            'Remove image': 'Supprimer l\'image',
            'Edit image': 'Modifier l\'image',
            'Image URL': 'URL de l\'image',
            'Upload': 'Télécharger',
            'Cancel': 'Annuler'
          },
          link: {
            'Link': 'Lien',
            'Enter a link': 'Entrez un lien',
            'Open in new tab': 'Ouvrir dans un nouvel onglet',
            'Link URL': 'URL du lien',
            'Link text': 'Texte du lien',
            'Add link': 'Ajouter un lien',
            'Edit link': 'Modifier le lien',
            'Remove link': 'Supprimer le lien',
            'Apply': 'Appliquer',
            'Cancel': 'Annuler'
          },
          marker: {
            'Marker': 'Surlignage',
            'Highlight': 'Surligner'
          }
        },
        ui: {
          'Add': 'Ajouter',
          'Delete': 'Supprimer',
          'Move up': 'Monter',
          'Move down': 'Descendre',
          'Settings': 'Paramètres',
          'Cancel': 'Annuler',
          'Save': 'Enregistrer',
          'Edit': 'Modifier',
          'Remove': 'Retirer',
          'Copy': 'Copier',
          'Paste': 'Coller',
          'Undo': 'Annuler',
          'Redo': 'Rétablir',
          'Bold': 'Gras',
          'Italic': 'Italique',
          'Underline': 'Souligné',
          'Strikethrough': 'Barré',
          'Inline Code': 'Code en ligne',
          'Link': 'Lien',
          'Unlink': 'Supprimer le lien',
          'Text': 'Texte',
          'Heading': 'Titre',
          'List': 'Liste',
          'Quote': 'Citation',
          'Code': 'Code',
          'Image': 'Image',
          'Marker': 'Surlignage',
          'Delimiter': 'Séparateur',
          "Unordered List": "Liste à puces",
          "Ordered List": "Liste numérotée"
        }
      }
    }
  };

  const finalConfig = { ...defaultConfig, ...config };

  onMount(async () => {
    try {
      setIsClient(true);

      const EditorJS = (await import('@editorjs/editorjs')).default;
      const ImageTool = (await import('@editorjs/image')).default;
      const HeaderTool = (await import('@editorjs/header')).default;
      const ListTool = (await import('@editorjs/list')).default;
      const MarkerTool = (await import('@editorjs/marker')).default;
      const QuoteTool = (await import('@editorjs/quote')).default;
      const CodeTool = (await import('@editorjs/code')).default;
      const DelimiterTool = (await import('@editorjs/delimiter')).default;
      const LinkTool = (await import('@editorjs/link')).default;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tools: Record<string, any> = {};

      tools.paragraph = {
        id: finalConfig.id,
        inlineToolbar: true,
        config: {
          placeholder: finalConfig.placeholder
        }
      };

      if (finalConfig.enableImages) {
        tools.image = {
          class: ImageTool,
          config: {
            types: 'image/*',
            maxFileSize: (finalConfig.maxImageSize || 5) * 1024 * 1024,
            captionPlaceholder: 'Légende de l\'image (optionnel)',
            buttonContent: 'Sélectionner une image',
            uploader: createImageUploader(finalConfig.maxImageSize),
          }
        };
      }

      if (finalConfig.enableHeaders) {
        tools.header = {
          class: HeaderTool,
          config: {
            placeholder: 'Entrez un titre',
            levels: [1, 2, 3, 4, 5, 6],
            defaultLevel: 2
          }
        };
      }

      if (finalConfig.enableLists) {
        tools.list = {
          class: ListTool,
          inlineToolbar: true,
          config: {
            defaultStyle: 'unordered'
          }
        };
      }

      if (finalConfig.enableLinks) {
        tools.linkTool = {
          class: LinkTool,
          config: {
            endpoint: '/api/link-preview' // Optionnel pour la prévisualisation
          }
        };
      }

      if (finalConfig.enableMarker) {
        tools.marker = {
          class: MarkerTool,
          shortcut: 'CMD+SHIFT+M'
        };
      }

      if (finalConfig.enableQuote) {
        tools.quote = {
          class: QuoteTool,
          inlineToolbar: true,
          config: {
            quotePlaceholder: 'Entrez une citation',
            captionPlaceholder: 'Auteur de la citation'
          }
        };
      }

      if (finalConfig.enableCode) {
        tools.code = {
          class: CodeTool,
          config: {
            placeholder: 'Entrez du code'
          }
        };
      }

      if (finalConfig.enableDelimiter) {
        tools.delimiter = DelimiterTool;
      }

      const editorInstance = new EditorJS({
        holder: editorId || 'editorjs',
        placeholder: finalConfig.placeholder,
        minHeight: finalConfig.minHeight,
        i18n: finalConfig.i18n,
        tools,
        data: initialData || {
          blocks: [
            {
              type: 'paragraph',
              data: {
                text: ''
              }
            }
          ]
        },
        onChange: async () => {
          try {
            const outputData = await editorInstance.save();
            if (outputData && outputData.blocks) {
              callbacks.onChange?.(outputData);
            }
          } catch (err) {
            console.error('Erreur lors de l\'extraction du contenu:', err);
          }
        },
        onReady: () => {
          setIsReady(true);
          callbacks.onReady?.();
        }
      });

      setEditor(editorInstance);
    } catch (err) {
      console.error('Erreur lors de l\'initialisation de l\'éditeur:', err);
      setError('Erreur lors de l\'initialisation de l\'éditeur');
      callbacks.onError?.(err as Error);
    }
  });

  onCleanup(() => {
    const editorInstance = editor();
    if (editorInstance && editorInstance.destroy) {
      editorInstance.destroy();
    }
  });

  const getContent = async (): Promise<OutputData | null> => {
    const editorInstance = editor();
    if (!editorInstance) return null;

    try {
      const outputData = await editorInstance.save();
      if (outputData && outputData.blocks) {
        return outputData;
      }
      return null;
    } catch (err) {
      console.error('Erreur lors de la récupération du contenu:', err);
      return null;
    }
  };



  const setEditorData = async (data: EditorData) => {

    const editorInstance = editor();
    if (!editorInstance) return;

    try {
      await editorInstance.render(data);
    } catch (err) {
      console.error('Erreur lors de la définition des données de l\'éditeur:', err);
    }
  };

  const clear = () => {
    const editorInstance = editor();
    if (!editorInstance) return;

    try {
      editorInstance.clear();
    } catch (err) {
      console.error('Erreur lors du nettoyage de l\'éditeur:', err);
    }
  };

  return {
    editor,
    isClient,
    isReady,
    error,
    getContent,
    setEditorData,
    clear
  };
};


