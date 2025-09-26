import { createMemo, For, Show } from "solid-js";
import { usePagination } from "./pagination.hook";

type PaginationProps = {
  onChange: (page: number, limit: number) => void
  total: number
}

export const Pagination = (props: PaginationProps) => {
  const { page, limit, handlePageChange } = usePagination(props.onChange);

  const totalPages = createMemo(() => {
    const l = Math.max(1, limit());
    const pages = Math.ceil((props.total || 0) / l);
    return Math.max(1, pages);
  });

  const clampAndGo = (nextPage: number) => {
    const clamped = Math.min(totalPages(), Math.max(1, nextPage));
    handlePageChange(clamped);
  };

  return (
    <div class="flex items-center gap-2 justify-center">
      <Show when={totalPages() > 1}>
        <button class="btn" disabled={page() <= 1} onClick={() => clampAndGo(page() - 1)}>Précédent</button>
        <div class="flex items-center gap-2">
          <select class="select" value={page()} onChange={(e) => clampAndGo(parseInt(e.currentTarget.value))}>
            <For each={[...Array(totalPages()).keys()]}>
              {(i) => <option value={i + 1}>{i + 1}</option>}
            </For>
          </select>
          <span>/ {totalPages()}</span>
        </div>
        <button class="btn" disabled={page() >= totalPages()} onClick={() => clampAndGo(page() + 1)}>Suivant</button>
      </Show>
    </div>
  )
}