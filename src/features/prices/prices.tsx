import { For, Show } from "solid-js"
import { usePrices } from "./price.ctrl"
import { prices } from "./price.store"
import { PriceDeleteModal } from "./Price-delete.modal"
import { LANGS } from "~/utils/constants"
import { Chevron } from "~/ui/Chevron/Chevron"

export const Prices = () => {
  const ctrl = usePrices()

  return (
    <div class="space-y-4 mt-4">
      <Show when={ctrl.isLoading()}>
        <div class="flex items-center justify-center h-full">
          Chargement des prix...
        </div>
      </Show>
      <Show when={!ctrl.isLoading()}>
        <For each={prices().sort((a, b) => a.position - b.position)}>
          {(price, index) => {
            const isEditing = () => ctrl.editingPriceId() === price.id

            return (
              <div class="flex gap-4">
                {/* Boutons de déplacement */}
                <div class="grid grid-rows-2 gap-2 items-center justify-center text-white">
                  <button
                    disabled={index() === 0}
                    type="button" onClick={() => ctrl.move(price.id, 'up')} >
                    <Chevron direction="up" />
                  </button>
                  <button
                    disabled={index() === prices().length - 1}
                    type="button" onClick={() => ctrl.move(price.id, 'down')}>
                    <Chevron direction="down" />
                  </button>
                </div>

                <div class="flex grow items-center gap-4 p-2 border border-gray-200 rounded-lg">
                  {/* Affichage en mode lecture */}
                  <Show
                    when={isEditing()}
                    fallback={
                      <>
                        <div class="flex-1 flex flex-col gap-3">

                          <div class="flex flex-col gap-2">
                            <div class="flex gap-4 flex-wrap text-lg">
                              <div class="flex items-center gap-2">
                                <span class="font-mono font-bold first-letter:uppercase">
                                  {price.translations?.fr?.name || '--'}
                                </span>
                              </div>

                              <div class="flex items-center gap-2">
                                <span class="text-sm text-gray-600">Montant:</span>
                                <span class="font-mono font-semibold whitespace-nowrap">
                                  {price.amount.toFixed(2)} €
                                </span>
                              </div>

                              <div class="flex items-center gap-2">
                                <span class="text-sm text-gray-600">Actif:</span>
                                <span class={price.is_active ? 'text-green-600' : 'text-gray-400'}>
                                  {price.is_active ? 'Oui' : 'Non'}
                                </span>
                              </div>

                              <div class="flex items-center gap-2">
                                <span class="text-sm text-gray-600">Preuve requise:</span>
                                <span class={price.requires_proof ? 'text-orange-600' : 'text-gray-400'}>
                                  {price.requires_proof ? 'Oui' : 'Non'}
                                </span>
                              </div>
                            </div>


                            {price.start_date && price.end_date && <div class="flex items-center gap-2">
                              <div class="flex items-center gap-2">
                                <span class="text-sm text-gray-600">Du:</span>
                                <span>
                                  {new Date(price.start_date).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                              <div class="flex items-center gap-2">
                                <span class="text-sm text-gray-600">Au:</span>
                                <span>
                                  {new Date(price.end_date).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                            </div>}

                            <div class="text-sm text-gray-600">
                              {price?.translations?.fr?.description && <p>{price.translations.fr.description}</p>}
                            </div>
                          </div>
                        </div>

                        <PriceDeleteModal
                          onDelete={() => ctrl.deletePrice(price.id)}
                          isLoading={ctrl.isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => ctrl.startEdit(price.id)}
                        >
                          Éditer
                        </button>
                      </>
                    }
                  >
                    {/* Mode édition */}
                    <div class="flex flex-col gap-3 w-full">
                      <div class="flex gap-6">
                        <div class="flex justify-between gap-3 w-full">
                          <div class="grid grid-cols-3 gap-3">

                            <div class="flex flex-col h-full gap-1">
                              <label for={`amount-${price.id}`} class="whitespace-nowrap text-sm text-gray-600">
                                Montant (€):
                              </label>
                              <input
                                id={`amount-${price.id}`}
                                type="number"
                                step="0.10"
                                min="0"
                                value={ctrl.editValues().amount ?? 0}
                                onInput={(e) => ctrl.updateEditValue('amount', parseFloat(e.currentTarget.value) || 0)}
                                class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary w-24"
                              />
                            </div>


                            <div class="flex gap-2 h-full items-center justify-center">
                              <input
                                id={`is_active-${price.id}`}
                                type="checkbox"
                                checked={ctrl.editValues().is_active ?? false}
                                onChange={(e) => ctrl.updateEditValue('is_active', e.currentTarget.checked)}
                              />
                              <label class="block" for={`is_active-${price.id}`}>
                                <span>Actif</span>
                              </label>
                            </div>


                            <div class="flex items-center gap-2 h-full justify-center">
                              <input
                                id={`requires_proof-${price.id}`}
                                type="checkbox"
                                checked={ctrl.editValues().requires_proof ?? false}
                                onChange={(e) => ctrl.updateEditValue('requires_proof', e.currentTarget.checked)}
                              />
                              <label class="whitespace-nowrap" for={`requires_proof-${price.id}`}>
                                <span class="whitespace-nowrap">Preuve requise</span>
                              </label>
                            </div></div>
                        </div>

                        <div class="flex gap-3 justify-end items-center">
                          {/* Boutons Annuler / Enregistrer */}
                          <div class="flex gap-2 items-start">
                            <button
                              type="button"
                              onClick={ctrl.cancelEdit}
                              class="secondary"
                            >
                              Annuler
                            </button>
                            <button
                              type="button"
                              onClick={() => ctrl.saveEdit(price.id)}
                            >
                              Enregistrer
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Champs de traduction */}
                      <div class="flex flex-col gap-3 mt-2 pt-3 border-t border-gray-200 max-w-lg">
                        <For each={LANGS}>
                          {(lang) => (
                            <div class="flex flex-col gap-2">
                              <div class="font-semibold uppercase text-sm text-gray-600">{lang}</div>
                              <div class="flex flex-col gap-2">
                                <div>
                                  <label for={`name-${price.id}-${lang}`} class="text-sm text-gray-600 block mb-1">
                                    Nom:
                                  </label>
                                  <input
                                    id={`name-${price.id}-${lang}`}
                                    type="text"
                                    value={ctrl.translations()[lang]?.name || ''}
                                    onInput={(e) => ctrl.updateTranslation(lang, 'name', e.currentTarget.value)}
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                  />
                                </div>
                                <div>
                                  <label for={`description-${price.id}-${lang}`} class="text-sm text-gray-600 block mb-1">
                                    Description:
                                  </label>
                                  <textarea
                                    id={`description-${price.id}-${lang}`}
                                    value={ctrl.translations()[lang]?.description || ''}
                                    onInput={(e) => ctrl.updateTranslation(lang, 'description', e.currentTarget.value)}
                                    rows={2}
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </For>
                      </div>
                    </div>


                  </Show>
                </div>
              </div>
            )
          }}
        </For>
      </Show>
    </div >
  )
}