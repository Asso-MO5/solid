import { createSignal } from "solid-js"
import type { Price } from "./prices.type"

export const [prices, setPrices] = createSignal<Price[]>([])
