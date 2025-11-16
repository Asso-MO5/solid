import { db } from "~/database"
import { events } from "~/database/schema"
import { and, gte, lte } from "drizzle-orm"

/**
 * API pour la feature events (collection)
 */

export const eventsGET = async ({ request }: { request: Request }) => {

  try {
    const url = new URL(request.url)
    const startDate = url.searchParams.get('start')
    const endDate = url.searchParams.get('end')

    let dbEvents

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)

      dbEvents = await db.select().from(events).where(
        and(
          gte(events.startDate, start),
          lte(events.startDate, end)
        )
      )
    } else {
      dbEvents = await db.select().from(events)
    }



    return Response.json(dbEvents)

  } catch (error) {
    console.error('Error fetching events:', error)
    return Response.json(
      { error: 'Erreur lors de la récupération des événements' },
      { status: 500 }
    )
  }
}
