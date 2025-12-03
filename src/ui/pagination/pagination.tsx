import { usePagination } from "./pagination.hook"

interface PaginationProps {
  currentPage: number
  totalPages: number
  limit?: number
  isLoading?: boolean
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
}

export const Pagination = (props: PaginationProps) => {
  const {
    pageInput,
    limitInput,
    handlePageChange,
    handlePageInputChange,
    handleLimitInputChange,
    handlePageInputBlur,
    handleLimitInputBlur
  } = usePagination(props)

  return (
    <div class="flex flex-col gap-4 w-full">
      <div class="flex items-center w-full justify-center">
        <div class="flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(1)}
            disabled={props.currentPage <= 1 || props.totalPages <= 1 || props.isLoading}
            title="Première page"
          >
            ««
          </button>
          <button
            onClick={() => handlePageChange(props.currentPage - 1)}
            disabled={props.currentPage <= 1 || props.totalPages <= 1 || props.isLoading}
          >
            Précédent
          </button>

          {/* Sélecteur de page */}
          <div class="flex items-center gap-1">
            <span class="text-sm text-gray-600">Page</span>
            <input
              type="number"
              min="1"
              max={props.totalPages}
              value={pageInput()}
              disabled={props.totalPages <= 1 || props.isLoading}
              onInput={(e) => {
                handlePageInputChange(e.currentTarget.value)
              }}
              onBlur={handlePageInputBlur}
            />
            <span class="text-sm text-gray-600">sur {props.totalPages}</span>
          </div>

          <button
            onClick={() => handlePageChange(props.currentPage + 1)}
            disabled={props.currentPage >= props.totalPages || props.totalPages <= 1 || props.isLoading}
          >
            Suivant
          </button>
          <button
            onClick={() => handlePageChange(props.totalPages)}
            disabled={props.currentPage >= props.totalPages || props.totalPages <= 1 || props.isLoading}
            title="Dernière page"
          >
            »»
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-600">
          Page {props.currentPage} sur {props.totalPages}
        </div>
        <div class="flex items-center gap-2">
          {props.onLimitChange && (
            <>
              <label class="text-sm text-gray-600 whitespace-nowrap">Éléments par page :</label>
              <input
                type="number"
                min="1"
                value={limitInput()}
                disabled={props.isLoading}
                class="max-w-20"
                onInput={(e) => {
                  handleLimitInputChange(e.currentTarget.value)
                }}
                onBlur={handleLimitInputBlur}
              />
            </>
          )}
        </div>

      </div>
    </div>
  )
}
