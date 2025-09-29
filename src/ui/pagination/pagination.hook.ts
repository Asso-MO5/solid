import { createSignal } from "solid-js";
import { onMount } from "solid-js";

export const usePagination = (onChange: (page: number, limit: number) => void) => {
  const [page, setPage] = createSignal(1);
  const [limit, setLimit] = createSignal(50);

  const handlePageChange = (page: number) => {
    setPage(page);
    onChange(page, limit());
    window.history.pushState({}, '', `?page=${page}&limit=${limit()}`);
  }

  const handleLimitChange = (limit: number) => {
    setLimit(limit);
    onChange(page(), limit);
    window.history.pushState({}, '', `?page=${page()}&limit=${limit}`);
  }

  onMount(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    if (pageParam) {
      setPage(parseInt(pageParam));
    }
    if (limitParam) {
      setLimit(parseInt(limitParam));
    }
    onChange(page(), limit());
    window.history.pushState({}, '', `?page=${page()}&limit=${limit()}`);
  })

  return {
    page,
    limit,
    handlePageChange,
    handleLimitChange,
  }
}

