
import { Show, createEffect, createMemo } from 'solid-js';
import type { EditorConfig, EditorCallbacks, EditorData } from './editor.types';
import { useEditor } from './editor.hook';

interface EditorViewProps {
  config?: EditorConfig;
  callbacks?: EditorCallbacks;
  class?: string;
  initialData?: EditorData | null;
}

export const EditorView = (props: EditorViewProps) => {
  const editorId = createMemo(() => `editorjs-${Math.random().toString(36).substr(2, 9)}`);

  const { isClient, isReady, error, setEditorData } = useEditor(
    props.config,
    props.callbacks,
    props.initialData || null,
    editorId()
  );

  createEffect(() => {
    const data = props.initialData;
    if (data && isReady()) {
      setEditorData(data);
    }
  });

  return (
    <div class={`editor-container ${props.class || ''}`}>
      <Show
        when={isClient()}
        fallback={
          <div class="p-4 min-h-[200px] flex items-center justify-center">
            <p class="text-gray-500">Chargement de l'éditeur...</p>
          </div>
        }
      >
        <Show
          when={!error()}
          fallback={
            <div class="p-4 min-h-[200px] bg-red-50 border border-red-200 rounded-md flex items-center justify-center">
              <p class="text-red-600">Erreur lors du chargement de l'éditeur</p>
            </div>
          }
        >
          <div
            id={editorId()}
            class="min-h-[200px]"
            style={{ opacity: isReady() ? 1 : 0.5 }}
          />
        </Show>
      </Show>
    </div>
  );
};
