import { onMount, Show } from "solid-js"
import { usePrices } from "~/features/prices/price.ctrl"
import { Prices } from "~/features/prices/prices"


const PricePage = () => {

  const { isLoading, getPrices, upsertPrice } = usePrices()

  onMount(() => {
    getPrices()
  })

  return (
    <div class="h-full w-full  relative overflow-y-auto " >
      <div class="absolute inset-0 grid grid-rows-[auto_1fr] gap-4" >
        <header class="flex w-full justify-between items-center gap2">
          <h1 class="text-2xl font-bold">Tarifs</h1>
          <div class="flex items-center justify-end gap-2">
            <button class="btn" onClick={() => upsertPrice()}
              disabled={isLoading()}>
              Ajouter un tarif
            </button>
          </div>
        </header>
        <div class="h-full relative">
          <div class="absolute inset-0 overflow-y-auto">
            <Show when={isLoading()}>
              <div class="flex items-center justify-center h-full">
                Chargement des prix...
              </div>
            </Show>
            <Show when={!isLoading()}>
              <Prices />
            </Show>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricePage